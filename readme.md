# Raafid Afraaz G Portfolio

Personal portfolio for Raafid Afraaz G, built with React, Vite, Tailwind CSS, Framer Motion, React Icons, and React Lottie.

## Sections

- Hero
- About
- Skills
- Experience
- Education
- Projects
- Achievements
- Contact


## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Admin Subdomain

For production, add `admin.raafidafraaz.in` as a domain on the same Vercel project. The same deployed app detects the hostname and renders the admin dashboard, so no separate repo or Vercel project is needed.

## Supabase Admin Setup

Required local environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAIL=raafid122@gmail.com
```

Run `supabase/schema.sql` in the Supabase SQL editor to create the portfolio tables, updated-at triggers, and RLS policies. The admin policies allow full access only for the authenticated user with email `raafid122@gmail.com`.

Initial seed data is prepared in `supabase/seed-data.json` from the current local portfolio constants. After logging in to the admin dashboard, use `Seed Initial Data` on the Dashboard to insert missing site content, projects, skills, experience, education, and achievements without duplicating existing rows.

Storage setup:

- Bucket: `portfolio-assets`
- Folders: `profile/`, `resume/`, `projects/`

Admin access:

- Local admin URL: `http://localhost:5173/admin`
- Production admin domain: `admin.raafidafraaz.in`

Admin workflow:

1. Run `npm run dev`.
2. Open `http://localhost:5173/admin`.
3. Sign in with the Supabase Auth user `raafid122@gmail.com`.
4. Use the sidebar sections for Dashboard, Projects, Site Content, Skills, Experience, Education, Achievements, Assets, and Settings.
5. Use the CRUD editors to add, edit, delete, reorder, or hide portfolio rows.
6. Use Assets to upload profile photos, resume PDFs, and project images to the `portfolio-assets` bucket.

Vercel setup:

- Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_EMAIL` to the same Vercel project.
- Add `admin.raafidafraaz.in` as a domain on the same Vercel project.
- Keep `raafidafraaz.in` and `admin.raafidafraaz.in` pointed at the same deployment.

Public data behavior:

- The public portfolio attempts to read Supabase `site_content`, `projects`, `skills`, `experience`, `education`, and `achievements`.
- If Supabase is missing, unavailable, or returns empty tables, the app falls back to the local constants so the public portfolio remains available.
