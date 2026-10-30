export type Account = { id: string; username: string; role: 'Teacher' | 'Student' };
export type StoredSession = { credential: string; account: Account };
export type SessionJournal = { active: StoredSession | null; pendingRevocations: StoredSession[] };
export type SessionSnapshot = {
  phase: 'loading' | 'signedOut' | 'signedIn' | 'error';
  account: Account | null;
  onlineAccess: 'unknown' | 'allowed' | 'blocked';
};
export type CloseableDatabase = { database: { closeAsync(): Promise<void> } };
type Dependencies = {
  load(): Promise<SessionJournal>;
  save(journal: SessionJournal): Promise<void>;
  open(id: string): Promise<CloseableDatabase>;
  revoke(credential: string): Promise<void>;
  me(credential: string): Promise<Account>;
  isUnauthorized(error: unknown): boolean;
};

export function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<StoredSession>;
  return typeof session.credential === 'string' && session.credential.length > 0 &&
    typeof session.account?.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.account.id) &&
    typeof session.account.username === 'string' &&
    (session.account.role === 'Teacher' || session.account.role === 'Student');
}

export class SessionController {
  private deps: Dependencies;
  private journal: SessionJournal = { active: null, pendingRevocations: [] };
  private database: CloseableDatabase | null = null;
  private work: Promise<unknown> = Promise.resolve();
  private generation = 0;
  private listeners = new Set<() => void>();
  private snapshot: SessionSnapshot = { phase: 'loading', account: null, onlineAccess: 'unknown' };

  constructor(deps: Dependencies) { this.deps = deps; }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private publish(snapshot: SessionSnapshot) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.work.then(operation);
    this.work = result.catch(() => undefined);
    return result;
  }
  private async persist(journal: SessionJournal) {
    await this.deps.save(journal);
    this.journal = journal;
  }
  private async close() {
    if (this.database) {
      await this.database.database.closeAsync();
      this.database = null;
    }
  }
  private async flush() {
    while (this.journal.pendingRevocations.length) {
      const pending = this.journal.pendingRevocations[0];
      try { await this.deps.revoke(pending.credential); }
      catch (error) { if (!this.deps.isUnauthorized(error)) throw error; }
      await this.persist({ ...this.journal, pendingRevocations: this.journal.pendingRevocations.slice(1) });
    }
  }

  restore = () => {
    const generation = ++this.generation;
    return this.exclusive(async () => {
      this.publish({ phase: 'loading', account: null, onlineAccess: 'unknown' });
      try {
        await this.close();
        this.journal = await this.deps.load();
        const active = this.journal.active;
        if (active) this.database = await this.deps.open(active.account.id);
        if (generation !== this.generation) { await this.close(); return; }
        this.publish({ phase: active ? 'signedIn' : 'signedOut', account: active?.account ?? null, onlineAccess: 'unknown' });
      } catch (error) {
        if (generation === this.generation) this.publish({ phase: 'error', account: null, onlineAccess: 'unknown' });
        throw error;
      }
    });
  };

  signIn = (login: () => Promise<StoredSession>) => {
    const generation = ++this.generation;
    return this.exclusive(async () => {
      await this.flush();
      const active = await login();
      if (!isStoredSession(active)) throw new Error('Invalid account response.');
      if (generation !== this.generation) throw new Error('Account operation canceled.');
      const previousAccount = this.journal.active?.account.id;
      if (previousAccount !== active.account.id || !this.database) {
        this.publish({ phase: 'loading', account: null, onlineAccess: 'unknown' });
        await this.close();
        this.database = await this.deps.open(active.account.id);
      }
      if (generation !== this.generation) { await this.close(); throw new Error('Account operation canceled.'); }
      try { await this.persist({ ...this.journal, active }); }
      catch (error) {
        await this.close();
        this.publish({ phase: 'error', account: null, onlineAccess: 'unknown' });
        throw error;
      }
      if (generation !== this.generation) { await this.close(); return; }
      this.publish({ phase: 'signedIn', account: active.account, onlineAccess: 'allowed' });
    }).catch((error: unknown) => {
      if (generation === this.generation && this.snapshot.phase === 'loading')
        this.publish({ phase: 'error', account: null, onlineAccess: 'unknown' });
      throw error;
    });
  };

  logout = () => {
    ++this.generation;
    this.publish({ phase: 'loading', account: null, onlineAccess: 'unknown' });
    return this.exclusive(async () => {
      try {
        const active = this.journal.active;
        // One durable write clears the active account and records its pending revocation.
        await this.persist({ active: null, pendingRevocations: active
          ? [...this.journal.pendingRevocations, active] : this.journal.pendingRevocations });
        await this.close();
        this.publish({ phase: 'signedOut', account: null, onlineAccess: 'unknown' });
        try { await this.flush(); } catch { /* Retry when connectivity or the app returns. */ }
      } catch (error) {
        this.publish({ phase: 'error', account: null, onlineAccess: 'unknown' });
        throw error;
      }
    });
  };

  reconnect = () => this.exclusive(async () => {
    const generation = this.generation;
    await this.flush();
    const active = this.journal.active;
    if (!active) return;
    try {
      const account = await this.deps.me(active.credential);
      if (generation !== this.generation) return;
      if (account.id !== active.account.id) throw new Error('Account response mismatch.');
      await this.persist({ ...this.journal, active: { ...active, account } });
      if (generation === this.generation)
        this.publish({ phase: 'signedIn', account, onlineAccess: 'allowed' });
    } catch (error) {
      if (generation === this.generation && this.deps.isUnauthorized(error))
        this.publish({ phase: 'signedIn', account: active.account, onlineAccess: 'blocked' });
      throw error;
    }
  });
}
