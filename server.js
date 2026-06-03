import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const participants = Array.from({ length: 12 }, (_, i) => ({
  name: `Teilnehmer ${i + 1}`,
  pin: String(1001 + i)
}));

const officialSchedule = [
  {
    "id": 1,
    "phase": "Gruppe A",
    "home": "Mexico",
    "away": "South Africa",
    "kickoff": "2026-06-11T21:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 2,
    "phase": "Gruppe A",
    "home": "South Korea",
    "away": "Czech Republic",
    "kickoff": "2026-06-12T04:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 3,
    "phase": "Gruppe B",
    "home": "Canada",
    "away": "Bosnia & Herzegovina",
    "kickoff": "2026-06-12T21:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 4,
    "phase": "Gruppe D",
    "home": "USA",
    "away": "Paraguay",
    "kickoff": "2026-06-13T03:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 5,
    "phase": "Gruppe B",
    "home": "Qatar",
    "away": "Switzerland",
    "kickoff": "2026-06-13T21:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 6,
    "phase": "Gruppe C",
    "home": "Brazil",
    "away": "Morocco",
    "kickoff": "2026-06-14T00:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 7,
    "phase": "Gruppe C",
    "home": "Haiti",
    "away": "Scotland",
    "kickoff": "2026-06-14T03:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 8,
    "phase": "Gruppe D",
    "home": "Australia",
    "away": "Turkey",
    "kickoff": "2026-06-14T06:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 9,
    "phase": "Gruppe E",
    "home": "Germany",
    "away": "Curacao",
    "kickoff": "2026-06-14T19:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 10,
    "phase": "Gruppe F",
    "home": "Netherlands",
    "away": "Japan",
    "kickoff": "2026-06-14T22:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 11,
    "phase": "Gruppe E",
    "home": "Ivory Coast",
    "away": "Ecuador",
    "kickoff": "2026-06-15T01:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 12,
    "phase": "Gruppe F",
    "home": "Sweden",
    "away": "Tunisia",
    "kickoff": "2026-06-15T04:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 13,
    "phase": "Gruppe H",
    "home": "Spain",
    "away": "Cape Verde",
    "kickoff": "2026-06-15T18:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 14,
    "phase": "Gruppe G",
    "home": "Belgium",
    "away": "Egypt",
    "kickoff": "2026-06-15T21:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 15,
    "phase": "Gruppe H",
    "home": "Saudi Arabia",
    "away": "Uruguay",
    "kickoff": "2026-06-16T00:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 16,
    "phase": "Gruppe G",
    "home": "Iran",
    "away": "New Zealand",
    "kickoff": "2026-06-16T03:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 17,
    "phase": "Gruppe I",
    "home": "France",
    "away": "Senegal",
    "kickoff": "2026-06-16T21:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 18,
    "phase": "Gruppe I",
    "home": "Iraq",
    "away": "Norway",
    "kickoff": "2026-06-17T00:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 19,
    "phase": "Gruppe J",
    "home": "Argentina",
    "away": "Algeria",
    "kickoff": "2026-06-17T03:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 20,
    "phase": "Gruppe J",
    "home": "Austria",
    "away": "Jordan",
    "kickoff": "2026-06-17T06:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 21,
    "phase": "Gruppe K",
    "home": "Portugal",
    "away": "DR Congo",
    "kickoff": "2026-06-17T19:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 22,
    "phase": "Gruppe L",
    "home": "England",
    "away": "Croatia",
    "kickoff": "2026-06-17T22:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 23,
    "phase": "Gruppe L",
    "home": "Ghana",
    "away": "Panama",
    "kickoff": "2026-06-18T01:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 24,
    "phase": "Gruppe K",
    "home": "Uzbekistan",
    "away": "Colombia",
    "kickoff": "2026-06-18T04:00:00+02:00",
    "deadline": "2026-06-11T20:00:00+02:00"
  },
  {
    "id": 25,
    "phase": "Gruppe A",
    "home": "Czech Republic",
    "away": "South Africa",
    "kickoff": "2026-06-18T18:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 26,
    "phase": "Gruppe B",
    "home": "Switzerland",
    "away": "Bosnia & Herzegovina",
    "kickoff": "2026-06-18T21:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 27,
    "phase": "Gruppe B",
    "home": "Canada",
    "away": "Qatar",
    "kickoff": "2026-06-19T00:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 28,
    "phase": "Gruppe A",
    "home": "Mexico",
    "away": "South Korea",
    "kickoff": "2026-06-19T03:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 29,
    "phase": "Gruppe D",
    "home": "USA",
    "away": "Australia",
    "kickoff": "2026-06-19T21:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 30,
    "phase": "Gruppe C",
    "home": "Scotland",
    "away": "Morocco",
    "kickoff": "2026-06-20T00:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 31,
    "phase": "Gruppe C",
    "home": "Brazil",
    "away": "Haiti",
    "kickoff": "2026-06-20T02:30:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 32,
    "phase": "Gruppe D",
    "home": "Turkey",
    "away": "Paraguay",
    "kickoff": "2026-06-20T05:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 33,
    "phase": "Gruppe F",
    "home": "Netherlands",
    "away": "Sweden",
    "kickoff": "2026-06-20T19:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 34,
    "phase": "Gruppe E",
    "home": "Germany",
    "away": "Ivory Coast",
    "kickoff": "2026-06-20T22:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 35,
    "phase": "Gruppe E",
    "home": "Ecuador",
    "away": "Curacao",
    "kickoff": "2026-06-21T02:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 36,
    "phase": "Gruppe F",
    "home": "Tunisia",
    "away": "Japan",
    "kickoff": "2026-06-21T06:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 37,
    "phase": "Gruppe H",
    "home": "Spain",
    "away": "Saudi Arabia",
    "kickoff": "2026-06-21T18:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 38,
    "phase": "Gruppe G",
    "home": "Belgium",
    "away": "Iran",
    "kickoff": "2026-06-21T21:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 39,
    "phase": "Gruppe H",
    "home": "Uruguay",
    "away": "Cape Verde",
    "kickoff": "2026-06-22T00:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 40,
    "phase": "Gruppe G",
    "home": "New Zealand",
    "away": "Egypt",
    "kickoff": "2026-06-22T03:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 41,
    "phase": "Gruppe J",
    "home": "Argentina",
    "away": "Austria",
    "kickoff": "2026-06-22T19:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 42,
    "phase": "Gruppe I",
    "home": "France",
    "away": "Iraq",
    "kickoff": "2026-06-22T23:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 43,
    "phase": "Gruppe I",
    "home": "Norway",
    "away": "Senegal",
    "kickoff": "2026-06-23T02:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 44,
    "phase": "Gruppe J",
    "home": "Jordan",
    "away": "Algeria",
    "kickoff": "2026-06-23T05:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 45,
    "phase": "Gruppe K",
    "home": "Portugal",
    "away": "Uzbekistan",
    "kickoff": "2026-06-23T19:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 46,
    "phase": "Gruppe L",
    "home": "England",
    "away": "Ghana",
    "kickoff": "2026-06-23T22:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 47,
    "phase": "Gruppe L",
    "home": "Panama",
    "away": "Croatia",
    "kickoff": "2026-06-24T01:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 48,
    "phase": "Gruppe K",
    "home": "Colombia",
    "away": "DR Congo",
    "kickoff": "2026-06-24T04:00:00+02:00",
    "deadline": "2026-06-18T17:00:00+02:00"
  },
  {
    "id": 49,
    "phase": "Gruppe B",
    "home": "Switzerland",
    "away": "Canada",
    "kickoff": "2026-06-24T21:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 50,
    "phase": "Gruppe B",
    "home": "Bosnia & Herzegovina",
    "away": "Qatar",
    "kickoff": "2026-06-24T21:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 51,
    "phase": "Gruppe C",
    "home": "Morocco",
    "away": "Haiti",
    "kickoff": "2026-06-25T00:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 52,
    "phase": "Gruppe C",
    "home": "Scotland",
    "away": "Brazil",
    "kickoff": "2026-06-25T00:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 53,
    "phase": "Gruppe A",
    "home": "South Africa",
    "away": "South Korea",
    "kickoff": "2026-06-25T03:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 54,
    "phase": "Gruppe A",
    "home": "Czech Republic",
    "away": "Mexico",
    "kickoff": "2026-06-25T03:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 55,
    "phase": "Gruppe E",
    "home": "Curacao",
    "away": "Ivory Coast",
    "kickoff": "2026-06-25T22:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 56,
    "phase": "Gruppe E",
    "home": "Ecuador",
    "away": "Germany",
    "kickoff": "2026-06-25T22:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 57,
    "phase": "Gruppe F",
    "home": "Tunisia",
    "away": "Netherlands",
    "kickoff": "2026-06-26T01:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 58,
    "phase": "Gruppe F",
    "home": "Japan",
    "away": "Sweden",
    "kickoff": "2026-06-26T01:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 59,
    "phase": "Gruppe D",
    "home": "Turkey",
    "away": "USA",
    "kickoff": "2026-06-26T04:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 60,
    "phase": "Gruppe D",
    "home": "Paraguay",
    "away": "Australia",
    "kickoff": "2026-06-26T04:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 61,
    "phase": "Gruppe I",
    "home": "Norway",
    "away": "France",
    "kickoff": "2026-06-26T21:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 62,
    "phase": "Gruppe I",
    "home": "Senegal",
    "away": "Iraq",
    "kickoff": "2026-06-26T21:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 63,
    "phase": "Gruppe H",
    "home": "Cape Verde",
    "away": "Saudi Arabia",
    "kickoff": "2026-06-27T02:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 64,
    "phase": "Gruppe H",
    "home": "Uruguay",
    "away": "Spain",
    "kickoff": "2026-06-27T02:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 65,
    "phase": "Gruppe G",
    "home": "New Zealand",
    "away": "Belgium",
    "kickoff": "2026-06-27T05:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 66,
    "phase": "Gruppe G",
    "home": "Egypt",
    "away": "Iran",
    "kickoff": "2026-06-27T05:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 67,
    "phase": "Gruppe L",
    "home": "Panama",
    "away": "England",
    "kickoff": "2026-06-27T23:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 68,
    "phase": "Gruppe L",
    "home": "Croatia",
    "away": "Ghana",
    "kickoff": "2026-06-27T23:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 69,
    "phase": "Gruppe K",
    "home": "Colombia",
    "away": "Portugal",
    "kickoff": "2026-06-28T01:30:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 70,
    "phase": "Gruppe K",
    "home": "DR Congo",
    "away": "Uzbekistan",
    "kickoff": "2026-06-28T01:30:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 71,
    "phase": "Gruppe J",
    "home": "Algeria",
    "away": "Austria",
    "kickoff": "2026-06-28T04:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 72,
    "phase": "Gruppe J",
    "home": "Jordan",
    "away": "Argentina",
    "kickoff": "2026-06-28T04:00:00+02:00",
    "deadline": "2026-06-24T20:00:00+02:00"
  },
  {
    "id": 73,
    "phase": "Sechzehntelfinale",
    "home": "Zweiter Gruppe A",
    "away": "Zweiter Gruppe B",
    "kickoff": "2026-06-28T21:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 74,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe E",
    "away": "Dritter Gruppe A/B/C/D/F",
    "kickoff": "2026-06-29T22:30:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 75,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe F",
    "away": "Zweiter Gruppe C",
    "kickoff": "2026-06-30T03:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 76,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe C",
    "away": "Zweiter Gruppe F",
    "kickoff": "2026-06-29T19:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 77,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe I",
    "away": "Dritter Gruppe C/D/F/G/H",
    "kickoff": "2026-06-30T23:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 78,
    "phase": "Sechzehntelfinale",
    "home": "Zweiter Gruppe E",
    "away": "Zweiter Gruppe I",
    "kickoff": "2026-06-30T19:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 79,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe A",
    "away": "Dritter Gruppe C/E/F/H/I",
    "kickoff": "2026-07-01T03:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 80,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe L",
    "away": "Dritter Gruppe E/H/I/J/K",
    "kickoff": "2026-07-01T18:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 81,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe D",
    "away": "Dritter Gruppe B/E/F/I/J",
    "kickoff": "2026-07-02T02:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 82,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe G",
    "away": "Dritter Gruppe A/E/H/I/J",
    "kickoff": "2026-07-01T22:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 83,
    "phase": "Sechzehntelfinale",
    "home": "Zweiter Gruppe K",
    "away": "Zweiter Gruppe L",
    "kickoff": "2026-07-03T01:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 84,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe H",
    "away": "Zweiter Gruppe J",
    "kickoff": "2026-07-02T21:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 85,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe B",
    "away": "Dritter Gruppe E/F/G/I/J",
    "kickoff": "2026-07-03T05:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 86,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe J",
    "away": "Zweiter Gruppe H",
    "kickoff": "2026-07-04T00:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 87,
    "phase": "Sechzehntelfinale",
    "home": "Sieger Gruppe K",
    "away": "Dritter Gruppe D/E/I/J/L",
    "kickoff": "2026-07-04T03:30:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 88,
    "phase": "Sechzehntelfinale",
    "home": "Zweiter Gruppe D",
    "away": "Zweiter Gruppe G",
    "kickoff": "2026-07-03T20:00:00+02:00",
    "deadline": "2026-06-28T19:00:00+02:00"
  },
  {
    "id": 89,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 74",
    "away": "Sieger Spiel 77",
    "kickoff": "2026-07-04T23:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 90,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 73",
    "away": "Sieger Spiel 75",
    "kickoff": "2026-07-04T19:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 91,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 76",
    "away": "Sieger Spiel 78",
    "kickoff": "2026-07-05T22:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 92,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 79",
    "away": "Sieger Spiel 80",
    "kickoff": "2026-07-06T02:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 93,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 83",
    "away": "Sieger Spiel 84",
    "kickoff": "2026-07-06T21:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 94,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 81",
    "away": "Sieger Spiel 82",
    "kickoff": "2026-07-07T02:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 95,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 86",
    "away": "Sieger Spiel 88",
    "kickoff": "2026-07-07T18:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 96,
    "phase": "Achtelfinale",
    "home": "Sieger Spiel 85",
    "away": "Sieger Spiel 87",
    "kickoff": "2026-07-07T22:00:00+02:00",
    "deadline": "2026-07-04T17:00:00+02:00"
  },
  {
    "id": 97,
    "phase": "Viertelfinale",
    "home": "Sieger Spiel 89",
    "away": "Sieger Spiel 90",
    "kickoff": "2026-07-09T22:00:00+02:00",
    "deadline": "2026-07-09T20:00:00+02:00"
  },
  {
    "id": 98,
    "phase": "Viertelfinale",
    "home": "Sieger Spiel 93",
    "away": "Sieger Spiel 94",
    "kickoff": "2026-07-10T21:00:00+02:00",
    "deadline": "2026-07-09T20:00:00+02:00"
  },
  {
    "id": 99,
    "phase": "Viertelfinale",
    "home": "Sieger Spiel 91",
    "away": "Sieger Spiel 92",
    "kickoff": "2026-07-11T23:00:00+02:00",
    "deadline": "2026-07-09T20:00:00+02:00"
  },
  {
    "id": 100,
    "phase": "Viertelfinale",
    "home": "Sieger Spiel 95",
    "away": "Sieger Spiel 96",
    "kickoff": "2026-07-12T03:00:00+02:00",
    "deadline": "2026-07-09T20:00:00+02:00"
  },
  {
    "id": 101,
    "phase": "Halbfinale",
    "home": "Sieger Spiel 97",
    "away": "Sieger Spiel 98",
    "kickoff": "2026-07-14T21:00:00+02:00",
    "deadline": "2026-07-14T19:00:00+02:00"
  },
  {
    "id": 102,
    "phase": "Halbfinale",
    "home": "Sieger Spiel 99",
    "away": "Sieger Spiel 100",
    "kickoff": "2026-07-15T21:00:00+02:00",
    "deadline": "2026-07-14T19:00:00+02:00"
  },
  {
    "id": 103,
    "phase": "Spiel um Platz 3",
    "home": "Verlierer Spiel 101",
    "away": "Verlierer Spiel 102",
    "kickoff": "2026-07-18T23:00:00+02:00",
    "deadline": "2026-07-18T21:00:00+02:00"
  },
  {
    "id": 104,
    "phase": "Finale",
    "home": "Sieger Spiel 101",
    "away": "Sieger Spiel 102",
    "kickoff": "2026-07-19T21:00:00+02:00",
    "deadline": "2026-07-19T19:00:00+02:00"
  }
];

async function q(text, params=[]) { return pool.query(text, params); }

async function importOfficialSchedule() {
  for (const g of officialSchedule) {
    await q(`INSERT INTO games(id,phase,home,away,kickoff,deadline,updated_at)
             VALUES($1,$2,$3,$4,$5,$6,NOW())
             ON CONFLICT(id) DO UPDATE SET
               phase=$2, home=$3, away=$4, kickoff=$5, deadline=$6, updated_at=NOW()`,
      [g.id, g.phase, g.home, g.away, g.kickoff, g.deadline]);
  }
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',
    ['Admin','WM-Spielplan importiert/aktualisiert','104 Spiele mit Wien/MESZ-Zeiten importiert']);
}

function deadlineFor(n, kickoff) {
  const found = officialSchedule.find(g => g.id === n);
  if (found) return found.deadline;
  if (kickoff) {
    const d = new Date(kickoff);
    d.setHours(d.getHours() - 2);
    return d.toISOString();
  }
  return null;
}
function phaseFor(n) {
  if (n <= 72) return 'Gruppenphase';
  if (n <= 104 && n >= 73) {
    if (n <= 88) return 'Sechzehntelfinale';
    if (n <= 96) return 'Achtelfinale';
    if (n <= 100) return 'Viertelfinale';
    if (n <= 102) return 'Halbfinale';
    if (n === 103) return 'Spiel um Platz 3';
    if (n === 104) return 'Finale';
  }
  return 'Sonstiges';
}
function defaultKickoff(n) {
  const found = officialSchedule.find(g => g.id === n);
  if (found) return found.kickoff;
  const start = new Date('2026-06-11T21:00:00+02:00');
  const d = new Date(start.getTime() + (n - 1) * 3 * 60 * 60 * 1000);
  return d.toISOString();
}

async function init() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL fehlt. Bitte in Render/Supabase setzen.');
  await q(`CREATE TABLE IF NOT EXISTS participants(id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, pin TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE);`);
  await q(`CREATE TABLE IF NOT EXISTS games(id INTEGER PRIMARY KEY, phase TEXT, home TEXT, away TEXT, kickoff TIMESTAMPTZ, deadline TIMESTAMPTZ, home_score INTEGER, away_score INTEGER, updated_at TIMESTAMPTZ DEFAULT NOW());`);
  await q(`CREATE TABLE IF NOT EXISTS tips(id SERIAL PRIMARY KEY, game_id INTEGER REFERENCES games(id), participant_id INTEGER REFERENCES participants(id), home_score INTEGER NOT NULL, away_score INTEGER NOT NULL, updated_by TEXT, updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(game_id, participant_id));`);
  await q(`CREATE TABLE IF NOT EXISTS special_tips(id SERIAL PRIMARY KEY, participant_id INTEGER REFERENCES participants(id), champion TEXT, top_scorer TEXT, updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(participant_id));`);
  await q(`CREATE TABLE IF NOT EXISTS audit(id SERIAL PRIMARY KEY, actor TEXT, action TEXT, details TEXT, created_at TIMESTAMPTZ DEFAULT NOW());`);
  const pc = await q('SELECT COUNT(*)::int c FROM participants');
  if (pc.rows[0].c === 0) for (const p of participants) await q('INSERT INTO participants(name,pin) VALUES($1,$2)', [p.name, p.pin]);
  const gc = await q('SELECT COUNT(*)::int c FROM games');
  if (gc.rows[0].c === 0) {
    await importOfficialSchedule();
  }
}

function requireAdmin(req,res,next){ if(req.headers['x-admin-password']===ADMIN_PASSWORD) next(); else res.status(401).json({error:'Admin-Passwort falsch'}); }
async function participantFromReq(req,res,next){ const { name, pin } = req.body; const r=await q('SELECT * FROM participants WHERE name=$1 AND pin=$2 AND is_active=true',[name,pin]); if(!r.rows[0]) return res.status(401).json({error:'Name/PIN falsch'}); req.participant=r.rows[0]; next(); }

app.get('/api/state', async (req,res)=>{
  const [games, parts, tips, specials] = await Promise.all([q('SELECT * FROM games ORDER BY id'), q('SELECT id,name FROM participants WHERE is_active=true ORDER BY id'), q('SELECT t.*, p.name participant FROM tips t JOIN participants p ON p.id=t.participant_id ORDER BY t.game_id,p.id'), q('SELECT s.*, p.name participant FROM special_tips s JOIN participants p ON p.id=s.participant_id')]);
  const now = new Date();
  const visibleTips = tips.rows.map(t=>{
    const g = games.rows.find(x=>x.id===t.game_id);
    const visible = g?.deadline ? now >= new Date(g.deadline) : false;
    return visible ? t : { game_id:t.game_id, participant_id:t.participant_id, participant:t.participant, hidden:true };
  });
  res.json({ games: games.rows, participants: parts.rows, tips: visibleTips, specials: specials.rows, pot: calcPot(games.rows, tips.rows) });
});
app.post('/api/login', participantFromReq, (req,res)=>res.json({ok:true, participant:{id:req.participant.id,name:req.participant.name}}));
app.post('/api/mytips', participantFromReq, async(req,res)=>{ const tips=await q('SELECT * FROM tips WHERE participant_id=$1',[req.participant.id]); const sp=await q('SELECT * FROM special_tips WHERE participant_id=$1',[req.participant.id]); res.json({tips:tips.rows, special:sp.rows[0]||null}); });
app.post('/api/tip', participantFromReq, async(req,res)=>{
  const { game_id, home_score, away_score }=req.body;
  const g=(await q('SELECT * FROM games WHERE id=$1',[game_id])).rows[0];
  if(!g) return res.status(404).json({error:'Spiel nicht gefunden'});
  if(g.deadline && new Date() > new Date(g.deadline)) return res.status(403).json({error:'Tippfrist abgelaufen'});
  await q(`INSERT INTO tips(game_id,participant_id,home_score,away_score,updated_by) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(game_id,participant_id) DO UPDATE SET home_score=$3, away_score=$4, updated_by=$5, updated_at=NOW()`, [game_id, req.participant.id, home_score, away_score, req.participant.name]);
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',[req.participant.name,'Tipp gespeichert',`Spiel ${game_id}: ${home_score}:${away_score}`]);
  res.json({ok:true});
});
app.post('/api/special', participantFromReq, async(req,res)=>{
  await q(`INSERT INTO special_tips(participant_id,champion,top_scorer) VALUES($1,$2,$3) ON CONFLICT(participant_id) DO UPDATE SET champion=$2, top_scorer=$3, updated_at=NOW()`, [req.participant.id, req.body.champion||'', req.body.top_scorer||'']);
  res.json({ok:true});
});
app.get('/api/admin', requireAdmin, async(req,res)=>{
  const [games, parts, tips, audit] = await Promise.all([q('SELECT * FROM games ORDER BY id'),q('SELECT * FROM participants ORDER BY id'),q('SELECT t.*,p.name participant FROM tips t JOIN participants p ON p.id=t.participant_id ORDER BY game_id,participant_id'),q('SELECT * FROM audit ORDER BY created_at DESC LIMIT 300')]);
  res.json({games:games.rows, participants:parts.rows, tips:tips.rows, audit:audit.rows, pot:calcPot(games.rows,tips.rows)});
});
app.post('/api/admin/import-schedule', requireAdmin, async(req,res)=>{
  await importOfficialSchedule();
  const games = await q('SELECT * FROM games ORDER BY id');
  res.json({ok:true, count: games.rows.length});
});
app.post('/api/admin/game', requireAdmin, async(req,res)=>{
  try {
    const {id,home,away,kickoff,deadline,home_score,away_score}=req.body;

    // Robustere ID-Verarbeitung: Browser/Render koennen Werte als Zahl oder Text liefern.
    // Entscheidend ist, ob die Datenbank ein Spiel mit dieser ID findet.
    const gameId = String(id ?? '').trim();
    if (!gameId) {
      return res.status(400).json({error:'Spiel-ID fehlt'});
    }

    const parseScore = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const parsed = Number.parseInt(String(value).trim(), 10);
      if (!Number.isFinite(parsed) || parsed < 0) throw new Error('Ergebnis muss eine Zahl ab 0 sein');
      return parsed;
    };

    const hs = parseScore(home_score);
    const as = parseScore(away_score);

    const updated = await q(
      `UPDATE games
       SET home=$2,
           away=$3,
           kickoff=NULLIF($4, '')::timestamptz,
           deadline=NULLIF($5, '')::timestamptz,
           home_score=$6,
           away_score=$7,
           updated_at=NOW()
       WHERE id=$1::int
       RETURNING *`,
      [gameId, home || '', away || '', kickoff || '', deadline || '', hs, as]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({error:`Spiel ${gameId} wurde in der Datenbank nicht gefunden`});
    }

    await q(
      'INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',
      ['Admin','Spiel aktualisiert',`Spiel ${gameId}: Ergebnis ${hs ?? '-'}:${as ?? '-'}`]
    );

    res.json({ok:true, game: updated.rows[0]});
  } catch (err) {
    console.error('Fehler beim Speichern des Spiels:', { message: err.message, body: req.body });
    res.status(400).json({error: err.message || 'Spiel konnte nicht gespeichert werden'});
  }
});

app.post('/api/admin/participant', requireAdmin, async(req,res)=>{
  const {id,name,pin}=req.body; await q('UPDATE participants SET name=$2,pin=$3 WHERE id=$1',[id,name,pin]); res.json({ok:true});
});
app.post('/api/admin/tip', requireAdmin, async(req,res)=>{
  const {game_id,participant_id,home_score,away_score}=req.body;
  await q(`INSERT INTO tips(game_id,participant_id,home_score,away_score,updated_by) VALUES($1,$2,$3,$4,'Admin') ON CONFLICT(game_id,participant_id) DO UPDATE SET home_score=$3, away_score=$4, updated_by='Admin', updated_at=NOW()`,[game_id,participant_id,home_score,away_score]);
  await q('INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)',['Admin','Tipp nachgetragen/geändert',`Spiel ${game_id}, Teilnehmer ${participant_id}: ${home_score}:${away_score}`]);
  res.json({ok:true});
});

function calcPot(games,tips){
  const byGame = Object.groupBy ? Object.groupBy(tips, t=>t.game_id) : tips.reduce((a,t)=>((a[t.game_id]??=[]).push(t),a),{});
  let carry=0, rows=[];
  for(const g of games.sort((a,b)=>a.id-b.id)){
    const pot = 18 + carry;
    let winners=[];
    if(g.home_score!==null && g.away_score!==null){ winners=(byGame[g.id]||[]).filter(t=>t.home_score===g.home_score && t.away_score===g.away_score); }
    const payout = winners.length ? +(pot / winners.length).toFixed(2) : 0;
    rows.push({game_id:g.id,pot,winners:winners.map(w=>w.participant||w.participant_id),payout_per_winner:payout});
    if(g.home_score!==null && g.away_score!==null) carry = winners.length ? 0 : pot;
  }
  return rows;
}

init().then(()=>app.listen(port,()=>console.log(`WM Tippspiel laeuft auf Port ${port}`))).catch(err=>{ console.error(err); process.exit(1); });