#!/usr/bin/env node
/**
 * awen-sync — read every card under vault/.srs/<slug>/*.json, summarise
 * per-note retention, and write the result back into vault/<slug>.md
 * frontmatter. Pure stdlib node, no deps.
 *
 * Managed frontmatter keys (rewritten on every run):
 *   created_at     ISO date  — first commit date of <slug>.md (git is the source of truth)
 *   updated_at     ISO date  — most recent commit date of <slug>.md
 *   srs_state      "new" | "learning" | "settling" | "settled"
 *   retention      0.0..1.0  — share of reviews answered with q ≥ 3
 *   card_count     int       — number of cards under this note
 *   reviewed_count int       — total review events recorded
 *   last_reviewed  ISO date  — most recent review across all cards
 *   next_due       ISO date  — earliest `due` across cards
 *
 * Other frontmatter keys are preserved verbatim. Lines containing the
 * managed keys are removed and re-emitted in the canonical order above.
 *
 * Usage:
 *   node scripts/awen-sync.mjs            # vault is ./vault
 *   AWEN_VAULT=/path node scripts/...     # override vault root
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';

const VAULT = process.env.AWEN_VAULT || './vault';
const SRS = join(VAULT, '.srs');

const MANAGED_KEYS = [
  'created_at',
  'updated_at',
  'srs_state',
  'retention',
  'card_count',
  'reviewed_count',
  'last_reviewed',
  'next_due',
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get [created_at, updated_at] for a vault file from git history.
 * - created_at: oldest commit date that touched the file
 * - updated_at: newest commit date that touched the file
 * Both are YYYY-MM-DD (committer date, ISO). Falls back to today if
 * the file isn't tracked yet.
 */
function gitDates(notePath) {
  try {
    // %cs = committer date in short ISO (YYYY-MM-DD)
    const out = execFileSync('git', ['log', '--format=%cs', '--', notePath], {
      cwd: VAULT.replace(/\/vault$/, '') || '.',
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) return [today(), today()];
    const lines = out.split('\n').filter(Boolean);
    return [lines.at(-1), lines.at(0)];
  } catch {
    return [today(), today()];
  }
}

function safeReaddir(p) {
  try { return readdirSync(p, { withFileTypes: true }); } catch { return []; }
}

function loadCards(slug) {
  const dir = join(SRS, slug);
  const out = [];
  for (const e of safeReaddir(dir)) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const path = join(dir, e.name);
    try {
      out.push(JSON.parse(readFileSync(path, 'utf8')));
    } catch (err) {
      console.error(`skip ${path}: ${err.message}`);
    }
  }
  return out;
}

function summarize(cards) {
  if (cards.length === 0) return null;
  const reviews = cards.flatMap((c) => c.history || []);
  const reviewed = reviews.length;
  const correct = reviews.filter((r) => (r.quality ?? 0) >= 3).length;
  const retention = reviewed === 0 ? null : correct / reviewed;
  const lastReviewed = reviews
    .map((r) => r.date)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;
  const nextDue = cards
    .map((c) => c.due)
    .filter(Boolean)
    .sort()
    .at(0) ?? null;

  // State derived from coverage of reps and ef.
  let state;
  if (reviewed === 0) {
    state = 'new';
  } else if (cards.every((c) => (c.reps ?? 0) >= 2 && (c.ef ?? 0) >= 2.5)) {
    state = 'settled';
  } else if (cards.every((c) => (c.reps ?? 0) >= 1)) {
    state = 'settling';
  } else {
    state = 'learning';
  }

  return {
    srs_state: state,
    retention: retention === null ? null : Math.round(retention * 100) / 100,
    card_count: cards.length,
    reviewed_count: reviewed,
    last_reviewed: lastReviewed,
    next_due: nextDue,
  };
}

function dateMeta(notePath) {
  const [createdAt, updatedAt] = gitDates(notePath);
  return { created_at: createdAt, updated_at: updatedAt };
}

/**
 * Split a markdown file into [frontmatterLines, bodyText].
 * frontmatterLines is null if no `---` block exists.
 */
function splitFrontmatter(text) {
  if (!text.startsWith('---\n')) return [null, text];
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return [null, text];
  const block = text.slice(4, end);
  const body = text.slice(end + 5);
  return [block.split('\n'), body];
}

function rebuildFrontmatter(originalLines, summary) {
  const userLines = originalLines.filter((line) => {
    const m = line.match(/^([a-zA-Z0-9_-]+)\s*:/);
    if (!m) return true;
    return !MANAGED_KEYS.includes(m[1]);
  });
  while (userLines.length && userLines.at(-1).trim() === '') userLines.pop();

  if (!summary) return userLines;

  const managed = [];
  for (const key of MANAGED_KEYS) {
    const v = summary[key];
    if (v === null || v === undefined) continue;
    managed.push(`${key}: ${v}`);
  }
  return userLines.length === 0 ? managed : [...userLines, ...managed];
}

function syncNote(slug) {
  const notePath = join(VAULT, `${slug}.md`);
  let raw;
  try { raw = readFileSync(notePath, 'utf8'); }
  catch { console.error(`skip ${slug}: ${notePath} not found`); return null; }

  const cards = loadCards(slug);
  const summary = summarize(cards);
  const dates = dateMeta(notePath);
  const merged = { ...dates, ...(summary ?? {}) };
  const haveAnything = Object.values(merged).some((v) => v !== null && v !== undefined);

  const [fmLines, body] = splitFrontmatter(raw);
  const lines = fmLines ?? ['title: ' + slug];
  const next = rebuildFrontmatter(lines, haveAnything ? merged : null);
  const fm = `---\n${next.join('\n')}\n---\n`;
  const out = fm + (fmLines ? body : raw);

  if (out !== raw) {
    writeFileSync(notePath, out);
    return { slug, summary, dates };
  }
  return null;
}

function listSrsSlugs() {
  return safeReaddir(SRS)
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);
}

function listAllSlugs() {
  return safeReaddir(VAULT)
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('.'))
    .map((e) => e.name.replace(/\.md$/, ''));
}

function main() {
  const srsSlugs = new Set(listSrsSlugs());
  const allSlugs = listAllSlugs();
  if (allSlugs.length === 0) {
    console.error(`no notes under ${VAULT}`);
    return;
  }
  let touched = 0;
  for (const slug of allSlugs) {
    const r = syncNote(slug);
    if (r) {
      touched++;
      const s = r.summary;
      if (srsSlugs.has(slug)) {
        const ret = s?.retention === null || s?.retention === undefined ? '—' : s.retention.toFixed(2);
        console.log(`✓ ${slug.padEnd(30)} state=${s?.srs_state ?? '—'} retention=${ret} cards=${s?.card_count ?? 0} due=${s?.next_due ?? '—'}`);
      } else {
        console.log(`✓ ${slug.padEnd(30)} dates=${r.dates.created_at}..${r.dates.updated_at}`);
      }
    }
  }
  console.log(`\nupdated ${touched} note(s)`);
}

main();
