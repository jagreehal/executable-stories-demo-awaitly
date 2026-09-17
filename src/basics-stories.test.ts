import { describe, expect, it } from 'vitest';
import { story } from 'executable-stories-vitest';

import { run, ok, err, type AsyncResult } from 'awaitly';
import { unwrapOk, unwrapErr } from 'awaitly/testing';

type User = { id: string; name: string };
type Order = { id: number; total: number };

story.feature({
  kind: 'ability',
  title: 'run() is the Result railway without the staircase',
  narrative: `
    Same three steps as src/basics.test.ts: getUser → validateUser → getOrders.

    A basic Result flow needs if (!ok) return at every step. run() unwraps ok
    values into the callback and short-circuits on err, so the body reads like
    happy-path code. The error union is inferred from the step map.

    src/awaitly.test.ts is the same railway in a thinner form so awaitly-analyze
    can draw it.
  `,
  glossary: [
    {
      term: 'run',
      definition:
        'Composes Result-returning steps. ok values unwrap into the callback; err short-circuits the rest of the flow.',
    },
    {
      term: 'ok / err',
      definition:
        'A Result is either ok(value) or err(tag). Both sit in the return type. run() infers the tag union from the step map.',
    },
  ],
});

const getUser = async (id: string): AsyncResult<User, 'NOT_FOUND'> => {
  if (id === 'empty') return ok({ id: 'empty', name: '' });
  return id === '1' ? ok({ id: '1', name: 'Alice' }) : err('NOT_FOUND');
};

const validateUser = async (user: User): AsyncResult<User, 'INVALID_USER'> =>
  user.name.length > 0 ? ok(user) : err('INVALID_USER');

const getOrders = async (
  _userId: string,
): AsyncResult<Order[], 'FETCH_ERROR'> => ok([{ id: 1, total: 99.99 }]);

const fetchUserAndOrders = (id: string) =>
  run({ getUser, validateUser, getOrders }, async (s) => {
    const user = await s.getUser(id);
    const validatedUser = await s.validateUser(user);
    const orders = await s.getOrders(validatedUser.id);
    return { user: validatedUser, orders };
  });

describe('Fetch user and orders with run()', () => {
  it('returns Alice and her orders', async ({ task }) => {
    story.init(task);
    story.note(
      's.getUser() yields User, not Result<User, …>. run() unwraps ok and the callback never sees the wrapper.',
    );
    story.table({
      label: 'What the type tells an AI',
      columns: ['Tag', 'Step'],
      rows: [
        ['NOT_FOUND', 'getUser'],
        ['INVALID_USER', 'validateUser'],
        ['FETCH_ERROR', 'getOrders'],
      ],
    });

    story.given('user id "1" exists');
    story.when('I fetch the user and their orders');
    const result = await fetchUserAndOrders('1');

    story.then('the result is Alice with one order totaling 99.99');
    const { user, orders } = unwrapOk(result);
    expect(user.name).toBe('Alice');
    expect(orders[0].total).toBe(99.99);
  });

  it('returns NOT_FOUND without throwing', async ({ task }) => {
    story.init(task);
    story.mermaid({
      title: 'Named error branches',
      code: `flowchart LR
  getUser -->|ok| validateUser
  validateUser -->|ok| getOrders
  getOrders -->|ok| Success
  getUser -->|err| NOT_FOUND
  validateUser -->|err| INVALID_USER
  getOrders -->|err| FETCH_ERROR`,
    });

    story.given('user id "missing" does not exist');
    story.when('I fetch the user and their orders');
    const result = await fetchUserAndOrders('missing');

    story.then('the error is the NOT_FOUND tag, not a thrown Error');
    expect(unwrapErr(result)).toBe('NOT_FOUND');
  });

  it('keeps INVALID_USER distinct from NOT_FOUND', async ({ task }) => {
    story.init(task);
    story.note(
      'run() short-circuits on the first err. validateUser fails with INVALID_USER and getOrders never runs. The tags stay distinct because they live in the Result, not a catch message.',
    );

    story.given('a user with an empty name');
    story.when('I fetch that user and their orders');
    const result = await fetchUserAndOrders('empty');

    story.then('the error is INVALID_USER');
    expect(unwrapErr(result)).toBe('INVALID_USER');
  });
});
