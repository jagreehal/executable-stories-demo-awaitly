import { describe, expect, it } from 'vitest';
import { story } from 'executable-stories-vitest';

import { run, ok, err, type AsyncResult } from 'awaitly';
import { unwrapOk } from 'awaitly/testing';

type User = { id: string; name: string };
type Order = { id: number; total: number };

const getUser = async (id: string): AsyncResult<User, 'NOT_FOUND'> =>
  id === '1' ? ok({ id: '1', name: 'Alice' }) : err('NOT_FOUND');

const validateUser = async (user: User): AsyncResult<User, 'INVALID_USER'> =>
  user.name.length > 0 ? ok(user) : err('INVALID_USER');

const getOrders = async (userId: string): AsyncResult<Order[], 'FETCH_ERROR'> =>
  ok([{ id: 1, total: 99.99 }]);


describe('Fetch user and orders', () => {
  it('returns Alice and her orders', async ({ task }) => {
    story.init(task);

    story.given('user id "1" exists');

    story.when('I fetch the user, validate them, and fetch their orders');

    const result = await run({ getUser, validateUser, getOrders }, async (s) => {
      const user = await s.getUser('1');
      await s.validateUser(user);
      const orders = await s.getOrders(user.id);
      return { user, orders };
    });

    story.then('the result is Alice with one order totaling 99.99');
    const { user, orders } = unwrapOk(result);
    expect(user.name).toBe('Alice');
    expect(orders[0].total).toBe(99.99);
  });
});
