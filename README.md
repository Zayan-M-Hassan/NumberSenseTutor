# Number Sense Tutor

Drill the UIL and TMSCA number sense tricks. 80 questions, 10 minutes, no scratch
paper — so the arithmetic has to be gone before you reach it.

A Next.js app with a bank of **128,000 questions — 1,000 per topic across 128
topics** — plus a timed mock test that follows real contest rules.

## Running it

```bash
npm install
npm run dev        # http://localhost:9002
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 9002 |
| `npm run build` | Production build (prerenders every topic and lesson) |
| `npm test` | Vitest — grading rules, exam scoring, question-bank guards |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |

## How grading works

Everything routes through `src/lib/answer.ts`. Nothing else may coerce an answer
with `Number()` — a fifth of the bank stores answers that aren't plain numbers
(`3/4`, `35 1/16`, `infinity`, `Perfect`), and coercing them produced `NaN`,
which made those questions impossible to get right.

The rules come from real UIL papers (2024 and 2025 district, regional and state):

- **Equivalent forms are accepted.** Answer keys list them side by side — `4/3`
  and `1 1/3` are both correct. Grading compares values, not notation.
- **Except repeating decimals.** The key states: *"If an answer is of the type
  like 2/3 it cannot be written as a repeating decimal."* So `0.75` passes `3/4`,
  but `0.666` fails `2/3`. A decimal only satisfies a fraction whose denominator
  divides a power of 10.
- **A stated form wins.** Where a question says `(mixed number)` or `(fraction)`,
  only that form counts.
- **Starred problems** take *approximate integral* answers: a whole number within
  5%. The accepted range is computed the way the answer key prints it (`450–496`).
  If no integer falls within 5%, the integral requirement is dropped rather than
  making the question unwinnable.

## Exam mode

`src/lib/exam.ts`. Verified against six real papers:

- 80 questions, 10 minutes.
- **Starred problems sit at positions 10, 20, 30 … 80** — exactly eight, always
  those slots. This held on every paper checked.
- **+5** correct, **−4** wrong, **−4** skipped — but questions left blank *beyond
  your last answer are not scored at all*. Stopping early is free; skipping in the
  middle is not. The result sheet shows both, including what you would have scored
  had you stopped at your last correct answer.
- Content is weighted by quartile from classifying 480 real questions: arithmetic
  and fractions early, functions/trig/calculus/matrices at the back.

## The question bank

`src/data/math-topics.json` is the source of truth — about 26 MB, and it is never
imported by application code. Everything the app reads is derived from it:

| Artifact | What it is |
|---|---|
| `src/data/topics/index.json` | id, name, summary, count — ~30 KB, the home page |
| `src/data/lessons/{id}.json` | lesson HTML only, server-rendered |
| `public/topics/{id}.json` | one topic's questions (~100 KB), fetched on demand |
| `public/exam-pool.json` | a 40-per-topic sample, fetched by `/exam` |

That split is why the page weight barely moved when the bank grew from 10,000 to
128,000 questions: no page ever bundles questions. A practice page ships the
topic's name and fetches the rest.

```bash
npx tsx scripts/audit.ts     # answer shapes, starred problems, duplicates
npx tsx scripts/expand-bank.ts  # top every topic up to 1,000 questions
npx tsx scripts/split-data.ts   # regenerate the runtime artifacts
```

**Run `split-data.ts` after any change to `math-topics.json`**, or the app serves
stale topics.

### Generating questions

`scripts/gen/` holds one generator per topic, keyed by id, grouped by section.
Each returns a question and a **computed** answer. `expand-bank.ts` runs them
until every topic holds 1,000 unique questions, and — importantly — pushes each
candidate through the real grader first: if it does not parse, or does not grade
itself correct, it is discarded rather than written.

Two things to know if you add a generator:

- Use the seeded `Rng` in `scripts/gen/helpers.ts`. It is mulberry32, not an LCG:
  a plain LCG overflows 2^53 in JS floats and collapses into a short cycle, which
  silently caps how many distinct questions you can produce.
- If a topic falls short of 1,000, widen its natural parameter range or add a
  real question variant. Do not pad.

### Question shape

```jsonc
{
  "id": 12,
  "text": "Calculate $4\\frac{1}{4} \\times 8\\frac{1}{4}$. (mixed number)",
  "answer": "35 1/16",          // a string, always — never a number
  "kind": "exact",              // exact | approximate | categorical
  "requiredForm": "mixed",      // optional; only that notation counts
  "tags": ["fractions"]         // used to weight exam-mode selection
}
```

Topic ids follow the source syllabus: `s1` multiplication tricks, `s2`
memorization, `s3` miscellaneous, `s4` advanced, `s5` contest coverage — types
that appear on real papers but were missing from the book (matrices, vectors,
inverse trig, double integrals, Texas land units, and others). Topics with no
questions are section headings, flagged `"section": true`.

### Adding questions

Prefer a generator in `scripts/gen/` over hand-authoring, and compute the answer
rather than typing it. Then add a case to `src/lib/generated-questions.test.ts`
that re-derives the answer from the question text a second way. Hand-authored
answers are how the original bank ended up 20% unusable.

`src/lib/bank.test.ts` guards the bank as a whole: every topic at 1,000+, no
duplicate text, every answer parseable and self-grading, and no page importing
the full bank.

## Notes

- `research/` is gitignored: it holds copyrighted UIL papers used only to derive
  rules, structure and topic distribution. No question is copied from them.
- Chart colours in `globals.css` are validated for colour-vision deficiency and
  contrast in both themes. Don't nudge them by eye.
