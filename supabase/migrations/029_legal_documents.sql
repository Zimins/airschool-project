-- 029: Admin-editable legal documents
--      (Terms of Service, Privacy Policy, Community Guidelines)
--
-- * public.legal_documents holds exactly three rows, keyed by slug:
--     'terms'                → /terms                (Terms of Service and User Agreement)
--     'privacy'              → /privacy              (Privacy Policy)
--     'community-guidelines' → /community-guidelines (Community Guidelines)
--   The slugs mirror LEGAL_DOCUMENT_SLUGS in src/services/LegalDocumentService.ts.
-- * Everyone can read them; only admins (public.is_admin(), migration 026) can
--   UPDATE. There is deliberately no INSERT/DELETE policy: the set of documents
--   is fixed here and the admin screen only edits them.
-- * Content is Markdown. The app renders it with react-native-markdown-display
--   (markdown-it with HTML disabled and javascript:/vbscript:/file:/data: links
--   rejected), so stored HTML is shown as plain text, never executed.
--   If the optional write-time sanitizer public.sanitize_content /
--   public.sanitize_line exists in the project, the trigger also runs it; this
--   file does not depend on it.
-- * Every change archives the previous version into
--   public.legal_document_versions (admin-readable), so we can always tell
--   which text was in force on a given date.
--
-- Safe to re-run, including on a project where the earlier terms/privacy-only
-- draft of this migration already ran (2026-10-28): existing rows are never
-- overwritten (ON CONFLICT DO NOTHING) and the slug check is replaced. The
-- seeded text is only the initial version; after an admin edits a document in
-- the app, the database copy is the source of truth.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_documents (
  slug           text PRIMARY KEY,
  title          text NOT NULL,
  content        text NOT NULL,
  effective_date date NOT NULL DEFAULT current_date,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Replace whatever slug check exists (the draft allowed only terms/privacy).
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.legal_documents'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%slug%'
  LOOP
    EXECUTE format('ALTER TABLE public.legal_documents DROP CONSTRAINT %I', c.conname);
  END LOOP;
END;
$$;

ALTER TABLE public.legal_documents
  ADD CONSTRAINT legal_documents_slug_check
  CHECK (slug IN ('terms', 'privacy', 'community-guidelines'));

CREATE TABLE IF NOT EXISTS public.legal_document_versions (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug           text NOT NULL REFERENCES public.legal_documents(slug) ON DELETE CASCADE,
  title          text NOT NULL,
  content        text NOT NULL,
  effective_date date NOT NULL,
  updated_at     timestamptz NOT NULL,
  updated_by     uuid,
  archived_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS legal_document_versions_slug_idx
  ON public.legal_document_versions (slug, archived_at DESC);

-- ---------------------------------------------------------------------------
-- 2. Privileges and RLS
-- ---------------------------------------------------------------------------
-- Defense in depth on top of RLS (TRUNCATE is not covered by RLS at all).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.legal_documents FROM anon;
REVOKE INSERT, DELETE, TRUNCATE ON public.legal_documents FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.legal_document_versions FROM anon, authenticated;
GRANT SELECT ON public.legal_documents TO anon, authenticated;
GRANT UPDATE ON public.legal_documents TO authenticated;
GRANT SELECT ON public.legal_document_versions TO authenticated;

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Legal documents are public" ON public.legal_documents;
CREATE POLICY "Legal documents are public" ON public.legal_documents
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can edit legal documents" ON public.legal_documents;
CREATE POLICY "Admins can edit legal documents" ON public.legal_documents
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read legal document history" ON public.legal_document_versions;
CREATE POLICY "Admins can read legal document history" ON public.legal_document_versions
  FOR SELECT TO authenticated USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Triggers
-- ---------------------------------------------------------------------------
-- Limits mirror LEGAL_DOCUMENT_LIMITS in src/services/LegalDocumentService.ts.
CREATE OR REPLACE FUNCTION public.normalize_legal_document()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.title   := regexp_replace(btrim(coalesce(NEW.title, '')), '\s+', ' ', 'g');
  NEW.content := btrim(coalesce(NEW.content, ''), E' \t\r\n');

  -- Optional write-time sanitizer (not part of this repository's migrations).
  IF to_regprocedure('public.sanitize_line(text, integer)') IS NOT NULL THEN
    EXECUTE 'SELECT public.sanitize_line($1, $2)' INTO NEW.title USING NEW.title, 200;
  END IF;
  IF to_regprocedure('public.sanitize_content(text, integer)') IS NOT NULL THEN
    EXECUTE 'SELECT public.sanitize_content($1, $2)' INTO NEW.content USING NEW.content, 100000;
  END IF;

  IF coalesce(NEW.title, '') = '' OR coalesce(NEW.content, '') = '' THEN
    RAISE EXCEPTION 'title and content are required' USING ERRCODE = 'check_violation';
  END IF;
  IF char_length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'title is too long (max 200 characters)' USING ERRCODE = 'check_violation';
  END IF;
  IF char_length(NEW.content) > 100000 THEN
    RAISE EXCEPTION 'content is too long (max 100000 characters)' USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.slug       := OLD.slug;
    NEW.updated_at := now();
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Runs as definer: legal_document_versions has no INSERT policy or privilege,
-- so only this trigger can write to it.
CREATE OR REPLACE FUNCTION public.archive_legal_document_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.title, OLD.content, OLD.effective_date)
     IS DISTINCT FROM (NEW.title, NEW.content, NEW.effective_date) THEN
    INSERT INTO public.legal_document_versions
      (slug, title, content, effective_date, updated_at, updated_by)
    VALUES
      (OLD.slug, OLD.title, OLD.content, OLD.effective_date, OLD.updated_at, OLD.updated_by);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.archive_legal_document_version() FROM PUBLIC;

-- The draft named the BEFORE trigger after its sanitizer; replace it.
DROP TRIGGER IF EXISTS sanitize_legal_document_before_write ON public.legal_documents;
DROP FUNCTION IF EXISTS public.sanitize_legal_document();

DROP TRIGGER IF EXISTS normalize_legal_document_before_write ON public.legal_documents;
CREATE TRIGGER normalize_legal_document_before_write
  BEFORE INSERT OR UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.normalize_legal_document();

DROP TRIGGER IF EXISTS archive_legal_document_after_update ON public.legal_documents;
CREATE TRIGGER archive_legal_document_after_update
  AFTER UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.archive_legal_document_version();

-- ---------------------------------------------------------------------------
-- 4. Initial text
--    Keep each body free of HTML and of anything that looks like a
--    javascript:/vbscript:/file:/data: link (including prose such as
--    "Personal data" followed by a colon), so an optional sanitizer leaves it
--    unchanged. tests/contracts/legal-documents.test.ts checks this.
-- ---------------------------------------------------------------------------
INSERT INTO public.legal_documents (slug, title, content, effective_date)
VALUES
('terms', 'Terms of Service and User Agreement', $terms$
Welcome to Preflightnet. These Terms of Service and User Agreement (the "Terms") are a binding agreement between you and Preflightnet ("Preflightnet", "we", "us" or "our"). They govern your access to and use of the Preflightnet website at preflightnet.com, our mobile applications and related services (together, the "Service").

By creating an account, or by accessing or using the Service, you agree to these Terms and acknowledge our [Privacy Policy](https://preflightnet.com/privacy). If you do not agree, please do not use the Service.

## 1. About the Service

Preflightnet helps aspiring pilots research flight training. The Service includes:

- a directory of flight schools with programs, locations and contact details;
- reviews and ratings written by users;
- a community board where users can post and comment; and
- study materials on pilot-training topics.

Preflightnet is an information platform. We are not a flight school, flight instructor, aviation authority or training provider. We do not enroll students, take payments on behalf of schools or arrange training. Unless we expressly say otherwise, we are not affiliated with, and do not endorse, any school listed on the Service.

## 2. Eligibility and accounts

- You must be at least 14 years old to create an account. If you are under the age of majority where you live, you may use the Service only with the permission and involvement of a parent or legal guardian.
- You must provide a valid email address and keep your account information accurate. A display name (nickname) is optional, but if you choose one it must not impersonate another person or organization.
- You are responsible for keeping your password confidential and for all activity under your account. Tell us promptly at [support@preflightnet.com](mailto:support@preflightnet.com) if you believe someone has accessed your account without permission.
- Each account is for one person. You may not sell, transfer or share your account.

## 3. School information

School listings are compiled from public sources, from schools themselves and from our own research. Programs, prices, certifications, aircraft, contact details and other information can change or contain errors, and we do not guarantee that any listing is accurate, complete or current.

Before you make any decision about flight training, verify important details directly with the school and, where relevant, with the aviation authority of your country (for example, the U.S. Federal Aviation Administration). Any arrangement you make with a school, including enrollment, payment, housing, visas and training, is solely between you and that school.

When you use **Request Info** on a school's page, the Service opens your own email app or phone with the school's contact details and, for email, a pre-filled message. You send that message directly to the school. We are not a party to that communication and are not responsible for a school's response or conduct.

## 4. Your content

"User Content" means anything you submit to the Service, such as reviews, ratings, community posts, comments and your display name.

- **Ownership.** You keep ownership of your User Content.
- **License to us.** You grant Preflightnet a worldwide, non-exclusive, royalty-free, transferable and sublicensable license to host, store, reproduce, display, distribute, format and adapt your User Content in order to operate, provide, improve and promote the Service. This license ends when your User Content is deleted from the Service, except for copies we must keep by law or that remain in backups for a limited time.
- **Public by default.** Reviews, posts, comments and your display name can be seen by anyone who visits the Service, including people without an account. Do not include personal information you do not want to make public.
- **Automatic formatting.** To protect other users, text is automatically cleaned when it is saved. For example, HTML, scripts and unsafe links are removed or neutralized, and length limits apply, so what is published may differ slightly from what you typed.
- **Your responsibility.** You are responsible for your User Content. You confirm that you have the rights needed to post it and that it complies with these Terms and applicable law.

## 5. Reviews

Reviews help other students, so they must be honest and based on your own experience.

- Review only schools you have personally attended, visited or dealt with, and describe your experience truthfully.
- Do not review a school you own, work for or compete with, and do not offer or accept payment, discounts or other incentives for a review.
- Do not post reviews on someone else's behalf or post several reviews of the same experience.

Reviews may be checked before they are published. We may decline, remove or label reviews that appear to break these rules, and we may post a public reply to a review. Ratings and reviews reflect the opinions of users, not of Preflightnet.

## 6. Community rules

When using the Service you must not:

1. break any law, or encourage anyone else to do so;
2. harass, threaten, bully or defame anyone, or post hateful, discriminatory, sexually explicit or violent content;
3. post false or misleading information, including fake reviews;
4. impersonate any person or organization, or misrepresent your relationship with a school;
5. post anyone else's personal information, such as contact details, documents or photos, without their permission;
6. post spam, chain messages, or advertising or solicitations we have not approved;
7. post content that infringes anyone's copyright, trademark, privacy or other rights, including exam questions or training materials you are not allowed to share;
8. upload or link to malware, or try to gain unauthorized access to the Service, other accounts or our systems;
9. scrape, crawl or collect information from the Service by automated means without our written permission; or
10. interfere with or disrupt the Service, or use it in a way that could damage, overload or impair it.

## 7. Moderation and enforcement

We may, but are not obliged to, review, refuse or remove any User Content, and we may restrict, suspend or terminate any account that we reasonably believe breaks these Terms or creates risk or legal exposure for us or others. Where reasonable and permitted by law, we will tell you why we acted and give you a chance to respond.

To report content or a user, email [support@preflightnet.com](mailto:support@preflightnet.com) with a link to the content and a short explanation.

## 8. Study materials and safety

Study materials, community discussions and other content on the Service are for general educational purposes only. They are not a substitute for training with a certified flight instructor, for an approved training program, or for official regulations, handbooks and publications issued by your aviation authority. Content may be incomplete or out of date, and we do not guarantee any exam result, certificate or rating.

**Never rely on the Service for flight planning, navigation, weather or any other operational decision.** Always use official, current sources and follow your instructor's guidance.

## 9. Our intellectual property

The Service, including its design, software, logos and the content we create (but not User Content or information supplied by schools), is owned by Preflightnet or its licensors and protected by intellectual-property laws. Subject to these Terms, we give you a personal, non-exclusive, non-transferable and revocable license to use the Service for your own non-commercial purposes. You may not copy, modify, distribute, sell or lease any part of the Service, or reverse-engineer its software, except as allowed by law or with our written permission.

If you send us feedback or suggestions, we may use them without any obligation to you.

## 10. Copyright complaints

If you believe content on the Service infringes your copyright, email [support@preflightnet.com](mailto:support@preflightnet.com) with (a) a description of the copyrighted work, (b) a link to the content you believe infringes it, (c) your contact details, (d) a statement that you believe in good faith the use is not authorized, and (e) a statement that the information in your notice is accurate and that you own the copyright or are authorized to act for the owner. We will remove infringing content where appropriate and may terminate the accounts of repeat infringers.

## 11. Third-party sites and services

The Service links to websites, social-media pages and services we do not control, including school websites. Your use of them is governed by their own terms and privacy policies, and we are not responsible for their content or practices.

## 12. Ending your account

You can delete your account at any time with **Delete Account** in **Profile Settings**. Deleting your account permanently removes your profile and the reviews, posts and comments linked to it. We may suspend or terminate your access as described in Section 7, or if we stop providing the Service, with reasonable advance notice where practical.

Sections 9 and 13 to 18 continue to apply after your account ends.

## 13. Disclaimers

To the fullest extent permitted by law, the Service is provided "as is" and "as available", without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy and non-infringement. We do not warrant that the Service will be uninterrupted, secure or error-free, or that any information on it, including school listings, reviews and study materials, is accurate, complete or reliable.

Some jurisdictions do not allow certain warranties to be excluded, so some of the above may not apply to you.

## 14. Limitation of liability

To the fullest extent permitted by law, Preflightnet and its operators, employees and partners will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, information, goodwill or opportunity, arising out of or in connection with the Service, User Content, or your dealings with any school or other user, even if we have been advised of the possibility of such damages. Our total liability for any claim relating to the Service is limited to the greater of (a) the amount you paid us for the Service in the 12 months before the claim and (b) USD 100.

Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including liability for our intentional misconduct or gross negligence, or your rights as a consumer under mandatory law.

## 15. Indemnity

To the extent permitted by law, you agree to indemnify and hold Preflightnet harmless from claims, losses and expenses (including reasonable legal fees) arising out of your User Content, your misuse of the Service, or your breach of these Terms or of anyone else's rights.

## 16. Changes to the Service and these Terms

We may change, add or remove features of the Service at any time. We may also update these Terms. When we do, we will post the updated Terms on this page and change the effective date shown above. If a change materially affects your rights, we will notify you through the Service or by email at least 7 days before it takes effect (30 days for changes that are unfavorable to you), unless the change is required by law or urgently needed for security. If you keep using the Service after the change takes effect, you accept the updated Terms. If you do not agree, you may stop using the Service and delete your account.

## 17. Governing law and disputes

These Terms are governed by the laws of the Republic of Korea, without regard to its conflict-of-law rules. Before bringing a claim, please contact us so we can try to resolve the dispute informally. A dispute that cannot be resolved informally will be submitted to the court with jurisdiction under the Civil Procedure Act of the Republic of Korea. If you are a consumer, you keep the protection of the mandatory laws of the country where you live and may also bring proceedings in its courts.

## 18. General

These Terms, together with the Privacy Policy, are the entire agreement between you and Preflightnet about the Service. If any provision is found unenforceable, the rest remain in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them as part of a merger, acquisition or sale of assets. If we provide a translation of these Terms, the English version controls to the extent permitted by law.

## 19. Contact us

Questions about these Terms? Email us at [support@preflightnet.com](mailto:support@preflightnet.com).
$terms$, DATE '2026-10-28'),
('privacy', 'Privacy Policy', $privacy$
This Privacy Policy explains how Preflightnet ("we", "us" or "our") collects, uses, shares and protects personal information when you use the Preflightnet website at preflightnet.com, our mobile applications and related services (the "Service"), and the choices and rights you have. It applies together with our [Terms of Service and User Agreement](https://preflightnet.com/terms).

## 1. Information we collect

**Information you give us**

- **Account** — your email address and password, required to create an account. Passwords are handled by our authentication provider and stored only in hashed form; we never see your password.
- **Profile** — a display name (nickname), if you choose to provide one.
- **Your content** — reviews and ratings, community posts and comments, and the date and time you posted them.
- **Messages to us** — anything you include when you email us, such as support requests or reports.

**Information collected automatically**

- **Sign-in session** — to keep you signed in, the Service stores an authentication token in your browser's local storage or in app storage on your device.
- **Technical and log information** — when your browser or device connects to the Service, our hosting and infrastructure providers automatically record technical information such as IP address, browser and device type, the pages or files requested, and the date and time. This is used to deliver the Service, keep it secure and diagnose problems.
- **Usage counters** — we keep aggregate counts, such as how many times a post was viewed or liked. These counts are not linked to your identity.

We do not use advertising cookies, third-party analytics or tracking pixels, and we do not track you across other websites or apps.

**Information we do not collect**

We do not collect payment card details, government identification numbers or precise location. When you use **Request Info** on a school's page, the Service opens your own email app or phone dialer. If you are signed in, the pre-filled email includes your display name and email address. That message or call goes directly from you to the school; we do not receive, store or read it.

## 2. How we use your information

We use personal information to:

- create and manage your account and keep you signed in;
- send you service emails, such as account confirmation and password-reset messages (we do not send marketing emails without your consent);
- display your reviews, posts and comments together with your display name;
- moderate content, enforce our Terms, and prevent spam, fraud and abuse;
- maintain, secure, troubleshoot and improve the Service;
- respond to your requests and communicate with you; and
- comply with legal obligations and protect the rights, safety and property of our users, Preflightnet and others.

We do not sell your personal information. We do not use it for targeted advertising, or for automated decisions that have legal or similarly significant effects on you.

**Legal bases (EEA, UK and similar laws).** We process personal information to perform our contract with you (providing your account and the Service), for our legitimate interests (keeping the Service safe, preventing abuse and improving it, balanced against your rights), to comply with legal obligations, and with your consent where required. You may withdraw consent at any time.

## 3. What is public

Your display name and the reviews, ratings, posts and comments you publish can be seen by anyone, including people without an account, and may be indexed by search engines. Please do not include sensitive information, or other people's personal information, in public content. We do not display your email address on the Service.

## 4. How we share information

We share personal information only as described below.

- **Service providers** that host and operate the Service for us, under terms that require them to protect it and use it only to provide their services:
  - **Supabase, Inc.** — database, user authentication, account emails and file storage, on servers in the United States;
  - **650 Industries, Inc. (Expo)** — website hosting and content delivery, and delivery of app updates, from the United States and a global edge network.
- **Review avatars** — reviews currently show a placeholder profile picture loaded from a third-party image service (i.pravatar.cc). When a review is displayed, the viewer's browser requests the image from that service, which receives the viewer's IP address and the reviewer's display name.
- **Legal reasons** — we may disclose information if we believe in good faith that it is required by law, regulation, legal process or a valid government request, or that it is needed to protect the rights, property or safety of our users, Preflightnet or others.
- **Business transfers** — if Preflightnet is involved in a merger, acquisition, financing or sale of assets, information may be transferred as part of that transaction, subject to this Privacy Policy.
- **With your consent** or at your direction.

We do not share your personal information with flight schools. Schools only receive what you send them yourself, for example through **Request Info**.

## 5. International transfers

The Service's servers are located in the United States, so your information is transferred to, stored in and processed in the United States, whose data-protection laws may differ from those of your country. Where required, we rely on appropriate safeguards for these transfers, such as contractual commitments from our providers.

- **Recipients** — Supabase, Inc. and 650 Industries, Inc. (Expo); their privacy contacts are listed at supabase.com/privacy and expo.dev/privacy
- **Country** — United States
- **Information transferred** — the information described in Section 1
- **When and how** — continuously, over encrypted network connections, whenever you use the Service
- **Purpose** — hosting, storing and delivering the Service
- **Retention** — as described in Section 6

If you do not want your information transferred abroad, you can choose not to create an account, or delete your account at any time. The Service cannot be provided without these transfers.

## 6. How long we keep information

- **Account and profile information** is kept for as long as your account exists.
- **Reviews, posts and comments** are kept until they are deleted or your account is deleted.
- **When you delete your account** (Profile Settings, then Delete Account), we immediately delete your account, profile, reviews, posts and comments from our live database. Copies may remain in encrypted backups for a limited period, generally no more than 30 days, until they are overwritten.
- **Server logs** kept by our providers are retained for a limited period, typically no more than 90 days, for security and troubleshooting.
- We may keep certain information longer when the law requires it, to resolve disputes or to enforce our agreements, and only for as long as that purpose requires.

Information we no longer need is permanently deleted from our systems so that it cannot be restored.

## 7. How we protect information

We take reasonable technical and organizational measures to protect personal information, including:

- encrypting connections to the Service with HTTPS (TLS);
- storing passwords only as salted hashes through our authentication provider;
- database access controls (row-level security) so that users can change only their own information and only authorized administrators can manage the Service;
- limiting administrator access to the people who need it to operate the Service; and
- automatically cleaning user-submitted text to block malicious code.

No method of transmission or storage is completely secure, so we cannot guarantee absolute security. If a breach affects your personal information, we will notify you and the relevant authorities as required by law.

## 8. Your rights and choices

Depending on where you live, you may have the right to:

- **access** the personal information we hold about you and receive a copy;
- **correct** inaccurate information;
- **delete** your information or your account;
- **restrict or object to** certain processing, or **withdraw consent** where processing is based on consent; and
- **portability**, meaning to receive your information in a commonly used format.

You can change your password and delete your account yourself in **Profile Settings**. For anything else, such as changing your display name or removing a particular review, post or comment, email [support@preflightnet.com](mailto:support@preflightnet.com) from the address linked to your account. We may need to verify your identity before acting on a request. We will respond without undue delay and within the time required by applicable law (generally within 30 days, or within 10 days where Korean law applies). We will not treat you differently for exercising your rights. A parent or legal guardian, or an agent you authorize, may also make a request on your behalf.

**California residents.** We do not sell personal information or share it for cross-context behavioral advertising, and we do not use sensitive personal information for purposes that would require offering a right to limit its use. You have the rights to know, delete and correct described above.

**EEA and UK residents.** You also have the right to lodge a complaint with your local data-protection supervisory authority.

**Republic of Korea residents.** For help with a privacy complaint, you may also contact:

- Personal Information Infringement Report Center (KISA) — privacy.kisa.or.kr, call 118
- Personal Information Dispute Mediation Committee — www.kopico.go.kr, call 1833-6972
- Supreme Prosecutors' Office, Cybercrime Investigation — www.spo.go.kr, call 1301
- Korean National Police Agency, Cyber Bureau — ecrm.police.go.kr, call 182

## 9. Children

The Service is not directed to children under 14, and we do not knowingly collect personal information from them. If you believe a child under 14 has given us personal information, contact us and we will delete it.

## 10. Cookies and local storage

We do not use cookies for advertising or analytics. The Service uses your browser's local storage, or app storage on your device, only to keep you signed in and to remember basic preferences. You can clear it in your browser or device settings, which will sign you out.

## 11. Third-party links

The Service links to third-party websites and services, such as school websites and our social-media pages (for example, Instagram and TikTok). Their own privacy policies govern any information you give them.

## 12. Changes to this Privacy Policy

We may update this Privacy Policy from time to time. We will post the updated version on this page with a new effective date and, if the changes are significant, notify you through the Service or by email before they take effect. Previous versions are available on request.

## 13. Contact us

Preflightnet is responsible for the personal information described in this Privacy Policy. For any privacy question or request, or to reach our privacy officer, email [support@preflightnet.com](mailto:support@preflightnet.com).
$privacy$, DATE '2026-10-28'),
('community-guidelines', 'Community Guidelines', $community_guidelines$
These Community Guidelines explain how to take part in the shared parts of Preflightnet: reviews, the community board, comments and study discussions (together, the "Community"). They are part of our [Terms of Service and User Agreement](https://preflightnet.com/terms). If these Guidelines and the Terms ever conflict, the Terms apply.

Preflightnet is a place for aspiring pilots to share honest experiences and help each other learn. Please keep it useful, respectful and safe.

## 1. Be respectful

- Treat other members the way you would want to be treated on the flight line. Disagree with ideas, not with people.
- Do not harass, threaten, bully or defame anyone.
- Do not post hateful or discriminatory content, including content that attacks people for their race, ethnicity, nationality, religion, gender, sexual orientation, disability or age.
- Do not post sexually explicit, graphic or violent content.

## 2. Be honest

- Share what you know or have experienced yourself, and make clear when something is your opinion.
- Do not post false or misleading information.
- Do not impersonate any person or organization, or misrepresent your relationship with a school.

## 3. Writing reviews

- Review only schools you have personally attended, visited or dealt with, and describe your experience truthfully.
- Do not review a school you own, work for or compete with, and do not offer or accept payment, discounts or other incentives for a review.
- Do not post reviews on someone else's behalf or post several reviews of the same experience.
- Criticism is welcome when it is factual and fair. Focus on the training and the school, not on personal attacks against individual instructors or staff.

## 4. Posting and commenting

- Use a clear title and pick the category that fits your post.
- Stay on topic: flight training, schools, licensing, careers and life as a student pilot.
- Check whether your question has already been answered before posting it again.
- Do not post spam, chain messages, referral links, or advertising or solicitations we have not approved. People who represent a school or business may answer questions, but must say who they represent.

## 5. Protect privacy

- Do not post anyone else's personal information, such as phone numbers, addresses, identity or license documents, or photos, without their permission.
- Think twice before sharing your own contact details in a public post. Posts, comments and reviews can be seen by anyone, including people without an account.

## 6. Respect other people's work

- Post only content you have the right to share. Do not copy exam questions, paid courses or training materials you are not allowed to distribute.
- Credit your sources when you quote or summarize someone else's work.

## 7. Safety first

Community posts and study materials are for general learning only. They never replace your flight instructor, an approved training program, or the official publications of your aviation authority.

**Never rely on the Community for flight planning, navigation, weather or any other operational decision.**

## 8. Reporting problems

If you see content that breaks these Guidelines, email [support@preflightnet.com](mailto:support@preflightnet.com) with a link to the content and a short explanation. Please do not respond to abuse with abuse.

## 9. Enforcement

Depending on how serious the problem is, we may remove or label content, send a warning, or restrict, suspend or terminate an account, as described in the Terms. Where reasonable and permitted by law, we will tell you why we acted and give you a chance to respond.

## 10. Changes to these Guidelines

We may update these Guidelines as the Community grows. When we do, we will post the updated version on this page and change the effective date shown above.

Questions about these Guidelines? Email us at [support@preflightnet.com](mailto:support@preflightnet.com).
$community_guidelines$, DATE '2026-11-23')
ON CONFLICT (slug) DO NOTHING;
