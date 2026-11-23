/**
 * Legal Document Service
 * Reads and updates the admin-editable Terms of Service, Privacy Policy and
 * Community Guidelines (table public.legal_documents, migration 029).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/** Display order everywhere (admin tabs, lists). Mirrors the slug check in migration 029. */
export const LEGAL_DOCUMENT_SLUGS = ['terms', 'privacy', 'community-guidelines'] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENT_SLUGS)[number];

/** Default names, used until the stored title has loaded. */
export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentSlug, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  'community-guidelines': 'Community Guidelines',
};

/** Same limits as the normalize_legal_document() trigger in migration 029. */
export const LEGAL_DOCUMENT_LIMITS = {
  title: 200,
  content: 100000,
} as const;

export interface LegalDocument {
  slug: LegalDocumentSlug;
  title: string;
  /** Markdown source. */
  content: string;
  /** Date the current text takes effect, as YYYY-MM-DD. */
  effective_date: string;
  updated_at: string;
}

export type LegalDocumentChanges = Pick<LegalDocument, 'title' | 'content' | 'effective_date'>;

export type LegalDocumentValidation =
  | { ok: true; changes: LegalDocumentChanges }
  | { ok: false; error: string };

const COLUMNS = 'slug, title, content, effective_date, updated_at';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD. */
export const isValidLegalDate = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

/**
 * Normalize an edited document the same way the database trigger does
 * (title whitespace collapsed, content trimmed) and check it before saving,
 * so the admin gets a clear message instead of a database error.
 */
export const validateLegalDocumentChanges = (draft: LegalDocumentChanges): LegalDocumentValidation => {
  const changes: LegalDocumentChanges = {
    title: draft.title.replace(/\s+/g, ' ').trim(),
    content: draft.content.trim(),
    effective_date: draft.effective_date.trim(),
  };

  if (!changes.title || !changes.content) {
    return { ok: false, error: 'Title and content are required.' };
  }
  if (changes.title.length > LEGAL_DOCUMENT_LIMITS.title) {
    return { ok: false, error: `Title is too long (max ${LEGAL_DOCUMENT_LIMITS.title} characters).` };
  }
  if (changes.content.length > LEGAL_DOCUMENT_LIMITS.content) {
    return {
      ok: false,
      error: `Content is too long (max ${LEGAL_DOCUMENT_LIMITS.content.toLocaleString('en-US')} characters).`,
    };
  }
  if (!isValidLegalDate(changes.effective_date)) {
    return { ok: false, error: 'Effective date must be a valid date in YYYY-MM-DD format.' };
  }
  return { ok: true, changes };
};

export class LegalDocumentService {
  private supabase: SupabaseClient;

  constructor(client: SupabaseClient = supabase) {
    this.supabase = client;
  }

  async getDocument(slug: LegalDocumentSlug): Promise<LegalDocument> {
    const { data, error } = await this.supabase
      .from('legal_documents')
      .select(COLUMNS)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as LegalDocument;
  }

  /** All stored documents in LEGAL_DOCUMENT_SLUGS order. */
  async getAllDocuments(): Promise<LegalDocument[]> {
    const { data, error } = await this.supabase.from('legal_documents').select(COLUMNS);

    if (error) throw error;
    const order = (slug: string) => LEGAL_DOCUMENT_SLUGS.indexOf(slug as LegalDocumentSlug);
    return ((data ?? []) as LegalDocument[])
      .filter((doc) => order(doc.slug) !== -1)
      .sort((a, b) => order(a.slug) - order(b.slug));
  }

  /**
   * Save an edited document and return the row as stored (the database
   * trigger may normalize it). Throws if the caller is not allowed to edit.
   */
  async updateDocument(slug: LegalDocumentSlug, changes: LegalDocumentChanges): Promise<LegalDocument> {
    const { data, error } = await this.supabase
      .from('legal_documents')
      .update(changes)
      .eq('slug', slug)
      .select(COLUMNS);

    if (error) throw error;
    // RLS turns a non-admin UPDATE into "0 rows updated" rather than an error.
    if (!data || data.length === 0) {
      throw new Error('You do not have permission to edit this document.');
    }
    return data[0] as LegalDocument;
  }
}

/** Format a YYYY-MM-DD date for display without shifting it across time zones. */
export const formatLegalDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};
