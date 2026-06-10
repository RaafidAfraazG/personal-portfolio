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

Initial seed data is prepared in `supabase/seed-data.json` from the current local portfolio constants. The next admin CRUD step can import this JSON into the tables after the schema is created.

Storage setup:

- Bucket: `portfolio-assets`
- Folders: `profile/`, `resume/`, `projects/`

Admin access:

- Local admin URL: `http://localhost:5173/admin`
- Production admin domain: `admin.raafidafraaz.in`
