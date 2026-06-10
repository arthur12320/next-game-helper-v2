import { vi } from "vitest";

/** Creates a chainable Drizzle builder mock that resolves to `result`. */
export function chainable(result: unknown = undefined) {
  const terminal = Promise.resolve(result);
  const chain: Record<string, unknown> = {};
  for (const m of ["from", "where", "set", "values", "limit", "returning"]) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = terminal.then.bind(terminal);
  chain.catch = terminal.catch.bind(terminal);
  chain.finally = terminal.finally.bind(terminal);
  return chain as unknown as Promise<typeof result> & Record<string, ReturnType<typeof vi.fn>>;
}

export function createDbMock() {
  return {
    select: vi.fn(() => chainable([])),
    insert: vi.fn(() => chainable()),
    update: vi.fn(() => chainable()),
    delete: vi.fn(() => chainable()),
    query: {
      campaigns: {
        findFirst: vi.fn(async () => undefined as unknown),
        findMany: vi.fn(async () => [] as unknown[]),
      },
      campaignInvites: {
        findFirst: vi.fn(async () => undefined as unknown),
        findMany: vi.fn(async () => [] as unknown[]),
      },
    },
  };
}

export type DbMock = ReturnType<typeof createDbMock>;
