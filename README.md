# Wedding RSVP Tracker

An elegant React application for managing wedding RSVP information for Nicholas Krilis and Elisabeth Feliciani. Powered by Supabase.

## Features

- **Family-based RSVP**: A guest enters any one family member's full name to access the whole family's RSVP — each person gets their own attendance, meal, and dietary fields.
- **Admin Panel** at `/admin`: Supabase Auth-protected dashboard to create families, add/edit/remove guests, and view RSVP responses.
- **Event Information**: Church ceremony and reception details
- **Elegant Design**: Grayscale theme with elegant typography

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database schema

In your Supabase project, open the **SQL Editor** and run the contents of [`supabase-schema.sql`](supabase-schema.sql). This creates two tables (`families`, `guests`), indexes, and RLS policies.

### 3. Create the admin user

In Supabase: **Authentication → Users → Add user** (or "Invite") with the admin email (e.g. `nickandliz26@gmail.com`) and a password. This is the account used to sign in at `/admin`.

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon/publishable key:

```bash
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

### 5. Run

```bash
npm start
```

- Guests: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`

## Data model

- `families` — one row per invited household: `id`, `family_name`.
- `guests` — one row per person: `family_id`, `full_name`, `email`, `church_attendance`, `reception_attendance`, `meal_preference`, `dietary_restrictions`, `rsvp_submitted_at`.

## Admin workflow

1. Sign in at `/admin` with your Supabase admin credentials.
2. Create a family (e.g. "The Smiths").
3. Add each guest by their full name.
4. Share the site link with guests — anyone in the family can type any one family member's name to open the family's shared RSVP.

## Security notes

- The anon/publishable key is safe to ship in the client. All write access for admin operations (creating families, adding/removing guests) is gated by Supabase Auth via RLS.
- Guests can read the `guests` table by design (so name lookup works) and can update RSVP fields. If you want to lock writes down further, see the `submit_rsvp` SECURITY DEFINER function included in `supabase-schema.sql`.

## Build

```bash
npm run build
```
