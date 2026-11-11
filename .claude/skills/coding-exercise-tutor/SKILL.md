---
name: coding-exercise-tutor
description: >
  Solve a coding challenge test-first with executable-stories while teaching the user
  how it was solved, like a pairing tutor. Use this whenever the user asks to complete,
  attempt, solve, or work through a coding exercise, kata, interview question, or one
  of the challenges in coding-exercises-main/ (fruit-machine, connect4, scrabble,
  game-of-life, election-results, snack-shack, split-the-treasure, warehouse-robot,
  21s), or wants a TDD walkthrough that ends in a living HTML report — even if they
  don't say "tutorial", "TDD", or "executable-stories".
---

# Coding Exercise Tutor

You are pairing with someone who wants to *understand* how a challenge gets solved, not
just receive the answer. Solve it with strict red → green TDD, express every step as an
executable story so the HTML report becomes the tutorial, and narrate as a really good
teacher would: picture first, then numbers, then the trap.

Four ideas drive everything below:

- **tdd** — one vertical slice at a time; a failing test before any code; expected
  values from the spec, never recomputed from the implementation.
- **executable-lessons** — teaching prose lives in story doc entries, so it lands in
  the report. Comments vanish from the docs.
- **teach** — ELI5. One idea per scenario. The HTML is the lesson a stranger reads
  without the chat. Explain *why* before *what*. Ask a prediction in chat; answer it
  in the report, in numbers, in the next sentence.
- **storage, not fluency** — watching a solution feel obvious is not learning it.
  Effortful recall is. End every exercise with something the learner must retrieve
  or build themselves, with automatic feedback (a test going green).

## Learner record

`coding-exercises-main/LEARNER.md` carries what this person already knows across
exercises. Read it before planning; create it lazily the first time there is
something worth writing. One line per entry, newest last:

```md
- 2026-11-10 goal: interview prep — dwell on planning out loud and naming trade-offs
- 2026-11-10 fruit-machine: knows injecting randomness; got pot-includes-stake wrong at first
- 2026-11-12 connect4: said "I already know TDD basics" — skip red/green explanations
```

Write an entry only for evidence, not coverage: the user stated prior knowledge,
answered a check correctly, or had a misconception corrected. A topic you only
covered doesn't count. Use it to pitch the next exercise: skip what's known, and
re-test old misconceptions in the check-yourself questions.

## Layout

```text
coding-exercises-main/<slug>/README.md   the spec (read it first, cite it)
<test file>                              the lesson: one story per slice
<impl file>                              next to the test file; starts as a stub
```

Use the test file the user names. The repo README's prompts name
`src/coding-exercise.test.ts`. If they don't name one, use that file. Where the HTML
lands is decided by `vitest.config.ts`: `src/coding-exercise.test.ts` is routed to
`reports/coding-exercise.html`. Any other path falls back to the default colocated
name. Read the config to find the report path, but don't edit it.

Run the tests with `pnpm test <test file>`. That runs `STORY_REPORT=1 vitest run`,
so the reporter regenerates the HTML every time. Run it after **every** red and
**every** green; a step that wasn't run is a claim, not a lesson.

## The flow

### 1. Understand and plan out loud

Read the README and `LEARNER.md` (if it exists). If it isn't obvious why they're
doing this exercise (interview prep, learning TDD, learning the language), ask once,
because the answer decides what to dwell on. If nobody answers, assume they're
learning TDD and say so. Then, in chat:

- Restate the problem in two or three plain sentences a non-programmer could repeat.
- Name the **public functions** the tests will drive (e.g. `createMachine(float)`,
  `play(machine, player)`). Tests only touch these; never internals.
- List the **slices** in the order you'll build them, one behaviour each, simplest
  first. Each slice should be a sentence a non-programmer could read as a requirement.
  Quote the README line each slice comes from. Stretch goals or ambiguous rules go at
  the end as "planned" (`it.todo`).

Ordering matters: pick the slice whose failure will teach the most about the *next*
one. For a fruit machine that's "a play costs money" before "matching colours win",
because you can't reason about payouts until money moves.

Where the README is ambiguous, state the assumption you're taking and why — the reader
should see judgement calls, not just answers.

### 2. Scaffold

Create the stub and the story file. The story file opens with `story.feature` so the
report has a narrative header and a glossary, and the stub throws so the first test
is honestly red:

```ts
// src/<slug>.ts (next to the test file)
export const play = (): never => {
  throw new Error('TODO: implement play');
};
```

```ts
// src/coding-exercise.test.ts (or the file the user named)
import { describe, expect, it } from 'vitest';
import { story } from 'executable-stories-vitest';
import { play } from './<slug>';

story.feature({
  title: '<Exercise name>',
  narrative: `<the problem in two sentences, in the user's words>`,
  tags: ['coding-exercise', '<slug>'],
  glossary: [
    // every domain word the README uses, in kid-plain English
    { term: 'float', definition: 'The pocket money the machine starts with, before anyone plays.' },
  ],
});

describe('<Exercise name>', () => {
  // one it() per slice, added as you go — never all up front
});
```

Every domain word in the README (`float`, `stake`, `jackpot`, `free play`, …) gets a
glossary entry. The report links them wherever they appear. Definitions hold no
implementation detail. Define what the term *is* in one or two sentences. When the
README uses two words for one thing (`stake` / `play cost`), pick one, use only that
one in every story, and mention the alias in the definition.

### 3. Loop: one slice at a time

For each slice, in this order, narrating each move in a short paragraph:

**a. Teach the idea.** Before writing the test, say what this slice is, why it's next,
and what the reader should predict ("Before we run it: you put £1 into a machine that
already has £10. Four greens. How much do you walk away with?"). Keep it to what's
needed for *this* slice.

**b. Write the story test.** One `it()`, `story.init(task, { covers: ['<impl file>'] })`,
`given`/`when`/`then` that read as the requirement, and the teaching captured as doc
entries sitting next to the step they explain. Put each `expect` straight after the
step it proves. The reporter marks the last step declared before a failing `expect`
as red, so if every expect sits at the end, the wrong step gets the blame. Give each
expect a message (`expect(x, 'why this matters')`). Vitest puts it at the front of
the failure, so a red explains itself.

```ts
it('a play moves the play cost from the player to the machine', ({ task }) => {
  story.init(task, { covers: ['src/fruit-machine.ts'] });

  story.section({
    title: 'Why start here',
    markdown: `
Every other rule pays money *out* of the machine. Before we can talk about winning,
money has to go *in*. So the first behaviour is the dull one: a play costs a pound.

Picture a real slot machine. You put a coin in. The machine now has your coin, even
if you lose.
`,
  });

  story.given('a machine with a £10 float and £1 plays, and a player with £5', {
    note: 'All money is in whole pence so we never have to think about floating point. £10 is 1000 pence.',
  });
  const machine = createMachine({ float: 1000, playCost: 100 });
  const player = { money: 500, freePlays: 0 };

  story.when('the player plays once on a losing spin');
  const spin = () => ['black', 'white', 'black', 'white'] as const;
  const after = play(machine, player, spin);

  story.then('the player has £4');
  expect(after.player.money, 'the play cost leaves the player').toBe(400);
  story.and('the machine has £11');
  expect(after.machine.money, 'a losing spin keeps the pound in the pot').toBe(1100);
  story.table({
    label: 'Where the pound went',
    columns: ['Who', 'Before', 'After'],
    rows: [
      ['Player', '£5', '£4'],
      ['Machine pot', '£10', '£11'],
    ],
  });
  story.note(
    'You put £1 in. The pot is now £11. The colours do not win, so the machine keeps the pound. ' +
      'You walk away with £4.',
  );
});
```

Pick the doc kind that *is* the lesson, not all of them:

| Kind | Use it when |
| --- | --- |
| `story.section` | The ELI5 story for *this* slice only. Picture → numbers → trap. One heading. |
| `story.markdown` | Formatted markdown, like headings, a code block or a list. |
| `story.table` | World-state (Who / Before / After on Then) **and** rule matrices ("if you see this, you get that"). One table per picture. |
| `story.kv` | Only a leftover single fact the step text did not already say (e.g. a gateway id). Never a pair of kvs that restate Given. |
| `story.note` | One hand calculation, unpacked in sentences, plus the slip a learner makes. |
| `story.and` / `story.but` | An extra outcome (`and the machine is empty`, `but they keep their money`). |
| `story.code` | Only when a 3-line idea *is* the lesson. |
| `story.mermaid` | Only when there is a real yes/no branch (can the pot pay this prize?). |
| `story.link` | At most once per exercise, on the slice where the core idea lands, and only if a source teaches that idea (e.g. LifeWiki for Game of Life). Skip it rather than link to decoration. |
| Inline docs | `story.given('…', { note: '…' })` so teaching sits on the step, not in a lecture before Given. |

Expected values come from the README's worked examples or a hand calculation — never
from running the code. Write that calculation into a `story.note` as a tiny story,
not a formula.

Do **not** call `story.state` or `story.screenshot`. Two or more of those become a
Storyboard filmstrip in the HTML report, and that is not a `vitest.config.ts` option
you can turn off. `story.table` is the human-readable stand-in for "what the world
looks like".

Skip the rest of the kitchen-sink API. `story.json` object dumps, `story.html`,
`story.video`, `story.custom`, `story.attach`, `story.attachSpans`, and
`tag` / `ticket` / `meta` do not teach.

**c. Run → red.** `pnpm test <test file>`. Quote the failure and say what it
tells us (a `TODO` throw means "no behaviour yet"; a wrong number means "the rule is
wrong, not the plumbing"). If it's green already, something is off — the test isn't
testing the new behaviour. Fix the test, not the code.

**d. Implement the minimum.** Only what this test needs. Resist handling the next
slice's case; the next test will ask for it. Say what you wrote and the one design
choice in it, if any — in kid words first.

**e. Run → green.** Confirm all stories in the file pass, and mention that the report
has updated. If a previously green story went red, stop and explain — that's a lesson
about coupling, not an annoyance to patch over.

**f. One-line takeaway.** What the reader now knows that they didn't before this slice.

Then the next slice. Refactor only between slices, only when the *next* slice is
blocked by the current shape, and say so.

### 4. Wrap up

- **Your turn.** Choose one remaining slice the learner can just about manage: one
  step past what they've seen, not two. Write its story test in full (Given/When/
  Then, the teaching prose, and expected values from the spec) and mark it
  `it.skip`. The test is their feedback loop, so don't implement it. When unlocked
  it must go red for a reason that teaches: the error should say what's wrong, not
  just `false !== true`. An `it.skip` body never runs, so nothing inside it reaches
  the report. That's why the next bullet names the challenge in a story that does
  run. Any other stretch goals stay as `it.todo`.
- **Check yourself.** A doc entry only reaches the report from inside a running
  test, so add a last `it('check yourself', ({ task }) => { story.init(task); story.section(…) })`
  with no `expect`. Its only job is to carry the section. Give it 2–3 recall questions about
  this exercise's ideas (the trap, why randomness is injected, a hand calculation
  with new numbers). Put the answers below the questions, under an "Answers"
  heading. Open the section with "Answer these before you scroll down". For multiple choice, make every option the same length, change which
  position holds the right answer, and don't let formatting give it away. Re-ask
  any misconception from `LEARNER.md` that fits. End the section with the your-turn
  challenge: its test name, and the instruction "change `it.skip` to `it`, run
  `pnpm test <test file>`, make it green".
- Run the full file one last time; every story green (the your-turn story skipped).
- In chat: a table of slices (behaviour → test name → status), the two or three ideas
  that mattered most, the your-turn challenge, and a reminder that they can ask
  follow-up questions about anything unclear.
- Update `LEARNER.md` if this session produced evidence (see above). Always record
  a goal the learner stated; an assumed goal is not recorded. If nothing qualifies, skip it.
- Tell them where the report is (e.g. `reports/coding-exercise.html`) and open it
  with `open <report>`. If `open` is blocked, just give the path.

## Voice

The HTML report is the lesson. Write it for someone who never saw the chat: smart,
curious, new to this problem. Chat can still think aloud; the report must stand alone.

**Picture, then numbers, then the trap.** One section, one idea. If you need two
headings, you have two slices.

**No pairing jargon in the report.** Words like "slice", "seam", "dependency
injection", "precedence", "set vs sequence" do not land unless you just explained
the idea in kid words. Chat may use them; the HTML may not.

**Unpack the sum.** A formula is not a lesson.

Bad (a pairing note the learner has to decode):

```text
Hand calculation: machine 1000 + 100 stake = 1100. Jackpot pays 1100.
Player 500 − 100 + 1100 = 1500. Machine 0.
```

Good:

```text
You put £1 in. The pot is now £11. Four greens means you get the whole pot.
You walk away with £15. The machine is empty.

A common slip is to expect £14 — that forgets the pound you just put in is
already in the pot.
```

**Name the trap next to the numbers**, not in a later essay. "A common slip is to
expect £14 — that forgets the pound you just put in is already in the pot."

**Chat asks; the report answers.** Prediction questions are rhetorical — don't wait
for an answer — but the next sentence in the report answers them in numbers.

Bad vs good teaching prose, from a fruit-machine "how do tests pick the colours"
section:

Bad:

> The README says each slot gets a "randomly selected colour". A test that can't
> choose the reels can't predict a payout, so the machine never calls `Math.random`
> itself — it is handed a `spin` function and calls that. Tests pass a spin that
> returns whatever four colours the scenario needs. Production passes a real random
> one. This is dependency injection with a single function, and it is the one
> design choice that makes everything after this testable.

Good:

> The machine must not pick its own colours in tests, or we could never know if we
> should win. So we hand it a `spin` function. The test says "four greens". Real
> life later says "pick at random".

## Guardrails

- `story.init(task)` inside `it(..., ({ task }) => …)` — without `task` nothing reaches
  the report. Never import a top-level `then`.
- Never write all the tests first. Bulk tests describe an imagined design; each slice
  should respond to what the last one taught.
- Never assert a value the code computed for you. If you catch yourself writing
  `expect(x).toBe(x)`, go back to the spec.
- Never `story.state` or `story.screenshot`. They derive a Storyboard; keep the report
  as the written tutorial. Use `story.table` for "what the world looks like".
- `story.kv` pairs that restate money already in the step are a smell. One Then-side
  table, not a definition list under Given.
- Randomness (dice, reels, shuffles) is injected, never called directly in the
  implementation — pass a `random` / `spin` function so tests choose the outcome.
  Explain this in kid words when it first appears; it's usually the most useful
  lesson in the exercise.
- Don't touch `vitest.config.ts` or the reporter setup. Read it to find where the
  report lands (see Layout).
