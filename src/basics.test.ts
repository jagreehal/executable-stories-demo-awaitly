import { describe, expect, it } from 'vitest';

import { ok, err, type AsyncResult, run } from 'awaitly';
import { unwrapOk } from 'awaitly/testing';

type User = { id: string; name: string };
type Order = { id: number; total: number };

// Same flow in both describes: getUser → validateUser → getOrders.
// try/catch hides failures in throws. Result puts them in the return type.

describe('1. Vanilla try/catch — errors are invisible', () => {

  it('returns Alice and her orders via try/catch', async () => {
    // Promise<User> looks total. NOT_FOUND only exists as a throw the type does not mention.
    const getUser = async (id: string): Promise<User> => {
      if (id === 'empty') return { id: 'empty', name: '' };
      if (id !== '1') throw new Error('NOT_FOUND');
      return { id: '1', name: 'Alice' };
    };

    const validateUser = async (user: User): Promise<User> => {
      if (user.name.length === 0) throw new Error('INVALID_USER');
      return user;
    };

    const getOrders = async (_userId: string): Promise<Order[]> => [
      { id: 1, total: 99.99 },
    ];

    const fetchUserAndOrders = async (
      id: string,
    ): Promise<{ user: User; orders: Order[] }> => {
      try {
        const user = await getUser(id);
        const validatedUser = await validateUser(user);
        const orders = await getOrders(validatedUser.id);
        return { user: validatedUser, orders };
      } catch {
        // One catch wraps every throw. Callers cannot tell which step failed.
        throw new Error('Failed to fetch user and orders');
      }
    };

    // Arrange
    const id = '1';

    // Act
    const { user, orders } = await fetchUserAndOrders(id);

    // Assert
    expect(user.name).toBe('Alice');
    expect(orders[0].total).toBe(99.99);
  });

 
});

describe('2. Result types — errors are in the signature', async () => {


  it('returns Alice and her orders as a Result', async () => {

    const getUser = async (id: string): AsyncResult<User, 'NOT_FOUND'> => {
      if (id === 'empty') return ok({ id: 'empty', name: '' });
      return id === '1' ? ok({ id: '1', name: 'Alice' }) : err('NOT_FOUND');
    };

    const validateUser = async (
      user: User,
    ): AsyncResult<User, 'INVALID_USER'> =>
      user.name.length > 0 ? ok(user) : err('INVALID_USER');

    const getOrders = async (
      _userId: string,
    ): AsyncResult<Order[], 'FETCH_ERROR'> => ok([{ id: 1, total: 99.99 }]);

    const result = await run(
      { getUser, validateUser, getOrders },
      async (s) => {
        const user = await s.getUser('1');
        const validatedUser = await s.validateUser(user);
        const orders = await s.getOrders(validatedUser.id);
        return { user: validatedUser, orders };
      },
    );

    const { user, orders } = unwrapOk(result);
    expect(user.name).toBe('Alice');
    expect(orders[0].total).toBe(99.99);

  });
});
