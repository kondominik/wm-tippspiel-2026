# WM Tippspiel 2026 - Render Version

Node/Express App mit PostgreSQL/Supabase Datenbank.

## Accounts
- GitHub: Repository erstellen und alle Dateien aus diesem Ordner hochladen.
- Supabase: kostenloses Projekt erstellen, Postgres Connection String kopieren.
- Render: Web Service aus GitHub Repo erstellen.

## Render Einstellungen
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `DATABASE_URL` = Supabase Connection String
  - `ADMIN_PASSWORD` = eigenes Admin-Passwort

## Standard Teilnehmer-PINs
Siehe Datei `teilnehmer_pins.txt`. Bitte nach dem ersten Login im Adminbereich ändern.
