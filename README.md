# Operations

Venue notes and maintenance jobs for a group of restaurant and bar lounges. A web app installed on the phone's home screen (Share → Add to Home Screen) that runs full screen.

- Hosting: GitHub Pages (this repo).
- Data, logins and photos: Supabase, with row-level security. Owners see everything; maintenance accounts only see jobs.
- Setup: run `supabase/schema.sql` in the Supabase SQL editor, then put the project URL and anon key in `config.js`.

No personal data is stored in this repository.
