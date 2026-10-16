import { useLocation } from 'react-router-dom';

// A test-only observer for destination and return-state assertions.
export function LocationObserver() {
  const location = useLocation();
  return <output data-testid="location">{JSON.stringify({ path: location.pathname, search: location.search, state: location.state })}</output>;
}
