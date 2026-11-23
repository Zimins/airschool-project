/**
 * Contract tests for the admin-editable legal documents
 * (Terms of Service, Privacy Policy, Community Guidelines).
 *
 * - Migration 029 must allow, seed and protect exactly the documents the app
 *   knows about, with the same limits as the client.
 * - The seeded text must survive the optional write-time sanitizer unchanged
 *   (no HTML, nothing that looks like a javascript:/data:/file: link).
 * - LegalDocumentService must surface a non-admin save as an error instead of
 *   silently "succeeding" with 0 rows.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SupabaseClient } from '@supabase/supabase-js';

// The real client reads Expo env at import time; these tests inject a fake.
jest.mock('../../src/lib/supabase', () => ({ supabase: {} }));

import {
  LEGAL_DOCUMENT_LIMITS,
  LEGAL_DOCUMENT_SLUGS,
  LegalDocumentService,
  formatLegalDate,
  isValidLegalDate,
  validateLegalDocumentChanges,
} from '../../src/services/LegalDocumentService';

const migration = readFileSync(join(__dirname, '../../supabase/migrations/029_legal_documents.sql'), 'utf8');

/** SQL with comments removed, so checks only look at statements. */
const statements = migration.replace(/--[^\n]*/g, '');

const SEEDS = [
  { slug: 'terms', tag: 'terms', title: 'Terms of Service and User Agreement' },
  { slug: 'privacy', tag: 'privacy', title: 'Privacy Policy' },
  { slug: 'community-guidelines', tag: 'community_guidelines', title: 'Community Guidelines' },
];

const seedBody = (tag: string): string => {
  const match = migration.match(new RegExp(`\\$${tag}\\$\\n([\\s\\S]*?)\\n\\$${tag}\\$`));
  if (!match) throw new Error(`No $${tag}$ block in migration 029`);
  return match[1];
};

describe('legal documents migration (029)', () => {
  it('allows exactly the slugs the app uses', () => {
    const check = statements.match(/CHECK \(slug IN \(([^)]*)\)\)/);
    expect(check).not.toBeNull();
    const slugs = check![1].split(',').map((s) => s.trim().replace(/'/g, ''));
    expect(slugs).toEqual([...LEGAL_DOCUMENT_SLUGS]);
  });

  it('seeds every document without overwriting edited text', () => {
    expect(SEEDS.map((s) => s.slug)).toEqual([...LEGAL_DOCUMENT_SLUGS]);
    for (const { slug, tag, title } of SEEDS) {
      expect(statements).toContain(`('${slug}', '${title}', $${tag}$`);
      expect(seedBody(tag).trim().length).toBeGreaterThan(1000);
    }
    expect(statements).toMatch(/ON CONFLICT \(slug\) DO NOTHING;\s*$/);
  });

  it.each(SEEDS)('seeds $slug text that a sanitizer would leave unchanged', ({ tag }) => {
    const body = seedBody(tag);
    // Mirrors the Markdown sanitizer rules: tag-like "<" and unsafe schemes.
    expect(body).not.toMatch(/<(?!(https?|mailto):[^>\s]+>)(?=[A-Za-z/!?])/);
    expect(body).not.toMatch(/(^|[^a-z0-9])(javascript|vbscript|livescript|mocha|data|file)\s*:/i);
    expect(body).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);
  });

  it('enforces the same length limits as the client', () => {
    expect(statements).toContain(`USING NEW.title, ${LEGAL_DOCUMENT_LIMITS.title}`);
    expect(statements).toContain(`char_length(NEW.title) > ${LEGAL_DOCUMENT_LIMITS.title}`);
    expect(statements).toContain(`USING NEW.content, ${LEGAL_DOCUMENT_LIMITS.content}`);
    expect(statements).toContain(`char_length(NEW.content) > ${LEGAL_DOCUMENT_LIMITS.content}`);
  });

  it('lets everyone read but only admins update', () => {
    expect(statements).toContain('ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;');
    expect(statements).toContain('ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;');

    const policies = statements.match(/CREATE POLICY[\s\S]*?;/g) ?? [];
    expect(policies).toHaveLength(3);
    const update = policies.filter((p) => /FOR UPDATE/.test(p));
    expect(update).toHaveLength(1);
    expect(update[0]).toMatch(/TO authenticated USING \(public\.is_admin\(\)\) WITH CHECK \(public\.is_admin\(\)\)/);
    expect(policies.filter((p) => /FOR (INSERT|DELETE|ALL)/.test(p))).toHaveLength(0);

    const history = policies.find((p) => /legal_document_versions/.test(p));
    expect(history).toMatch(/FOR SELECT TO authenticated USING \(public\.is_admin\(\)\)/);

    expect(statements).toContain('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.legal_documents FROM anon;');
  });
});

describe('validateLegalDocumentChanges', () => {
  const valid = { title: 'Community Guidelines', content: '## Be kind', effective_date: '2026-11-23' };

  it('normalizes the text the same way the database does', () => {
    expect(
      validateLegalDocumentChanges({
        title: '  Community \n  Guidelines ',
        content: '\n\n## Be kind\n\n',
        effective_date: ' 2026-11-23 ',
      }),
    ).toEqual({ ok: true, changes: valid });
  });

  it('requires a title and content', () => {
    expect(validateLegalDocumentChanges({ ...valid, title: '   ' })).toEqual({
      ok: false,
      error: 'Title and content are required.',
    });
    expect(validateLegalDocumentChanges({ ...valid, content: '\n \n' }).ok).toBe(false);
  });

  it('rejects text over the limits', () => {
    expect(validateLegalDocumentChanges({ ...valid, title: 'a'.repeat(LEGAL_DOCUMENT_LIMITS.title + 1) }).ok).toBe(
      false,
    );
    expect(
      validateLegalDocumentChanges({ ...valid, content: 'a'.repeat(LEGAL_DOCUMENT_LIMITS.content) }).ok,
    ).toBe(true);
    expect(
      validateLegalDocumentChanges({ ...valid, content: 'a'.repeat(LEGAL_DOCUMENT_LIMITS.content + 1) }),
    ).toEqual({ ok: false, error: 'Content is too long (max 100,000 characters).' });
  });

  it('rejects an effective date that is not a real YYYY-MM-DD date', () => {
    for (const effective_date of ['2026-02-30', '2026/11/23', 'Nov 23, 2026', '']) {
      expect(validateLegalDocumentChanges({ ...valid, effective_date }).ok).toBe(false);
    }
    expect(isValidLegalDate('2028-02-29')).toBe(true);
  });
});

describe('formatLegalDate', () => {
  it('shows the stored date without shifting it across time zones', () => {
    expect(formatLegalDate('2026-11-23')).toBe('November 23, 2026');
    expect(formatLegalDate('not-a-date')).toBe('not-a-date');
  });
});

/** Minimal stand-in for the supabase-js query builder. */
const fakeClient = (result: { data: unknown; error: unknown }) => {
  const calls: unknown[][] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'update', 'eq']) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, ...args]);
      return builder;
    };
  }
  builder.single = () => {
    calls.push(['single']);
    return Promise.resolve(result);
  };
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  const client = {
    from: (table: string) => {
      calls.push(['from', table]);
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, calls };
};

describe('LegalDocumentService', () => {
  const row = (slug: string) => ({
    slug,
    title: slug,
    content: `${slug} text`,
    effective_date: '2026-11-23',
    updated_at: '2026-11-23T00:00:00Z',
  });
  const changes = { title: 'Community Guidelines', content: '## Be kind', effective_date: '2026-11-23' };

  it('lists the documents in display order and ignores unknown rows', async () => {
    const { client } = fakeClient({
      data: [row('privacy'), row('unknown'), row('community-guidelines'), row('terms')],
      error: null,
    });
    const docs = await new LegalDocumentService(client).getAllDocuments();
    expect(docs.map((d) => d.slug)).toEqual(['terms', 'privacy', 'community-guidelines']);
  });

  it('saves the changes to the requested document and returns the stored row', async () => {
    const stored = { ...row('community-guidelines'), ...changes };
    const { client, calls } = fakeClient({ data: [stored], error: null });
    await expect(new LegalDocumentService(client).updateDocument('community-guidelines', changes)).resolves.toEqual(
      stored,
    );
    expect(calls).toEqual([
      ['from', 'legal_documents'],
      ['update', changes],
      ['eq', 'slug', 'community-guidelines'],
      ['select', 'slug, title, content, effective_date, updated_at'],
    ]);
  });

  it('reports a save blocked by RLS (non-admin) as a permission error', async () => {
    const { client } = fakeClient({ data: [], error: null });
    await expect(new LegalDocumentService(client).updateDocument('terms', changes)).rejects.toThrow(
      'You do not have permission to edit this document.',
    );
  });

  it('passes database errors through', async () => {
    const dbError = { message: 'title and content are required', code: '23514' };
    const { client } = fakeClient({ data: null, error: dbError });
    await expect(new LegalDocumentService(client).updateDocument('terms', changes)).rejects.toBe(dbError);
    await expect(new LegalDocumentService(client).getDocument('terms')).rejects.toBe(dbError);
  });
});
