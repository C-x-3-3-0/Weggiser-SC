/**
 * POC placeholder for the real matchday fetch.
 *
 * In production this script calls the IFV Matchcenter for club 381
 * (https://matchcenter.ifv.ch/default.aspx?v=381&oid=7&lng=1&a=as), finds
 * today's home games and writes them into public/data/matchday.json, using
 * public/data/garderoben.json for the default changing-room assignment per
 * team. That HTTP call and HTML parsing are out of scope for this POC — this
 * script only shows the shape of that pipeline by regenerating matchday.json
 * from the checked-in sample fixtures with today's date.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

interface Garderoben {
  defaults: Record<string, string>;
}

interface Match {
  time: string;
  home: string;
  away: string;
  field: 'Thermoplan Arena' | 'Black&White Arena';
  garderobeHeim: string;
  garderobeGast: string;
  status: 'live' | 'verschoben' | 'abgesagt' | null;
}

const garderoben: Garderoben = JSON.parse(
  readFileSync(join(dataDir, 'garderoben.json'), 'utf-8')
);

// POC sample fixtures — a real implementation replaces this with parsed
// IFV Matchcenter results for today.
const sampleFixtures: Array<Pick<Match, 'time' | 'home' | 'away' | 'field' | 'status'>> = [
  { time: '10:00', home: 'Junioren F-rot', away: 'FC Küssnacht', field: 'Black&White Arena', status: null },
  { time: '11:30', home: 'Junioren Ca', away: 'SC Horw', field: 'Black&White Arena', status: null },
  { time: '13:00', home: 'WSC II', away: 'FC Buochs', field: 'Black&White Arena', status: null },
  { time: '14:30', home: 'WSC I', away: 'FC Stans', field: 'Thermoplan Arena', status: null },
];

const matches: Match[] = sampleFixtures.map((fixture) => ({
  ...fixture,
  garderobeHeim: garderoben.defaults[fixture.home] ?? '?',
  garderobeGast: '8/9',
}));

const output = {
  generatedAt: new Date().toISOString(),
  matches,
};

writeFileSync(join(dataDir, 'matchday.json'), JSON.stringify(output, null, 2) + '\n');

console.log(`Wrote ${matches.length} matches to public/data/matchday.json`);
