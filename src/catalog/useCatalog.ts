import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { loadAccountCatalog } from './catalogData';
import { CatalogError } from './catalogStore';
import type { Catalog } from './types';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; catalog: Catalog }
  | { status: 'error'; legacySchema: boolean };

/**
 * Loads the catalog for one account. Mount it under a component keyed by the
 * account ID so a different account starts from a fresh loading state.
 */
export function useCatalog(accountId: string) {
  const { controller } = useAuth();
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    controller.withAccount(accountId, loadAccountCatalog).then(
      (catalog) => { if (active) setState({ status: 'ready', catalog }); },
      (error: unknown) => {
        if (active) setState({
          status: 'error',
          legacySchema: error instanceof CatalogError && error.code === 'legacy_schema',
        });
      },
    );
    return () => { active = false; };
  }, [controller, accountId, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  /** Reloads saved data while the current catalog stays on screen. Rejects on failure. */
  const refresh = useCallback(async () => {
    const catalog = await controller.withAccount(accountId, loadAccountCatalog);
    if (mounted.current) setState({ status: 'ready', catalog });
  }, [controller, accountId]);

  return { state, retry, refresh };
}
