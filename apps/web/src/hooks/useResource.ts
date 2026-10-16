import { useEffect, useState } from 'react';
import { postError } from '../services/posts';

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>, identity = '') {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(null);
    load(controller.signal).then((value) => {
      if (!controller.signal.aborted) setData(value);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(postError(reason));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [load, attempt, identity]);
  return { data, setData, loading, error, retry: () => setAttempt((value) => value + 1) };
}
