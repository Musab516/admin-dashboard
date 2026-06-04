# Admin Dashboard

A production-minded admin dashboard built with React + Supabase. Admins can create organizations, invite members, and manage their organization directory.

## Live URLs

- **Production**: https://admin-dashboard-gamma-khaki.vercel.app
- **Development Preview**: deployed from the `development` branch on Vercel

## Test Credentials

Email: `musabsiddiqui05@gmail.com`
Password: (provided separately)

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite with SWC
- React Router v6
- Tailwind CSS + shadcn/ui (manual setup)
- TanStack React Query
- React Hook Form + Zod
- Supabase (Auth, Postgres, Edge Functions, RLS)
- Vercel (deployment)

## Features

- Admin sign-up / sign-in with Supabase Auth
- Protected routes — unauthenticated users redirected to login
- Create organizations with 3 types: School, Nonprofit, Business
- Conditional fields per type (School District, Registration Number, Industry Sector)
- Invite members by email via Supabase Edge Function
- Members list with invited/active status badges
- Organization directory with type badges and member counts
- Delete organizations
- Full RLS — admins can only access their own data

## Branching Strategy

- `main` — production branch, deployed to Vercel Production
- `development` — default working branch, deployed to Vercel Preview
- Feature branches off `development`, merged via pull request

## Setup

1. Clone the repo
```bash
   git clone git@github.com:Musab516/admin-dashboard.git
   cd admin-dashboard
```

2. Install dependencies
```bash
   npm install
```

3. Copy environment variables
```bash
   cp .env.example .env.local
```

4. Fill in `.env.local` with your Supabase credentials:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
5. Run the schema migration in Supabase SQL Editor:
   - Copy contents of `supabase/migrations/20260604000000_initial_schema.sql`
   - Paste and run in your Supabase project SQL Editor

6. Deploy the Edge Function:
```bash
   supabase link --project-ref your-project-ref
   supabase functions deploy invite-member
```

7. Start the dev server:
```bash
   npm run dev
```

## Data Model

- `profiles` — linked to auth.users, stores full_name and is_admin flag
- `organizations` — name, type (school/nonprofit/business), created_by, type-specific fields
- `organization_members` — email, status (invited/active), role, linked to org

## RLS Policies

All tables have RLS enabled. Admins can only read/write organizations they created. Members are only accessible through orgs the admin owns.

## Edge Function

`supabase/functions/invite-member` validates the caller's JWT, verifies org ownership, checks for duplicate invitations, and inserts the member record. Email delivery is stubbed with a TODO comment for plugging in Resend/SendGrid.

## Tradeoffs & What I'd Do With More Time

- Add actual email delivery via Resend
- Implement invitation acceptance flow (invited user clicks link, signs up, member row gets linked)
- Add search/filter on the organization directory
- Role-based permissions within orgs (admin vs member)
- End-to-end tests with Playwright
- Better error boundaries and offline handling
