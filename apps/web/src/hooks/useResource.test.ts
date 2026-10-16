import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useResource } from './useResource';

it('aborts outdated reads so late results cannot replace newer data', async () => {
  let finish!: (value: string) => void;
  const first = vi.fn((signal: AbortSignal) => { void signal; return new Promise<string>((resolve) => { finish = resolve; }); });
  const second = vi.fn(async (signal: AbortSignal) => { void signal; return 'new result'; });
  const { result, rerender } = renderHook(({ load }) => useResource(load), { initialProps: { load: first as (signal: AbortSignal) => Promise<string> } });
  rerender({ load: second });
  await waitFor(() => expect(result.current.data).toBe('new result'));
  expect(first.mock.calls[0][0].aborted).toBe(true);
  await act(async () => finish('old result'));
  expect(result.current.data).toBe('new result');
});
it('retries failed reads', async () => {
  const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('recovered');
  const { result } = renderHook(() => useResource(load));
  await waitFor(() => expect(result.current.error).not.toBe(''));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.data).toBe('recovered'));
});
