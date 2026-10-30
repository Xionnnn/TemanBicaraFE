import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { openUserDatabase } from '../database/database';
import { ApiError, authApi, type Verification } from './api';
import { SessionController } from './session';
import { sessionStorage } from './storage';

const controller = new SessionController({ ...sessionStorage, open: openUserDatabase,
  revoke: authApi.revoke, me: authApi.me,
  isUnauthorized: (error) => error instanceof ApiError && error.status === 401 });

const AuthContext = createContext<{
  controller: SessionController;
  snapshot: ReturnType<SessionController['getSnapshot']>;
  online: boolean;
  verification: Verification | null;
  setVerification: (verification: Verification | null) => void;
} | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [online, setOnline] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);
  const connecting = useRef(false);

  useEffect(() => {
    let mounted = true;
    const reconnect = async () => {
      const phase = controller.getSnapshot().phase;
      if (!mounted || phase === 'loading' || phase === 'error' || connecting.current) return;
      connecting.current = true;
      try { await controller.reconnect(); } catch { /* Local access survives API failure. */ }
      finally { connecting.current = false; }
    };
    void controller.restore().catch(() => undefined);
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected === true && state.isInternetReachable !== false;
      if (mounted) setOnline(connected);
      if (connected) void reconnect();
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void NetInfo.fetch().then((network) => {
        if (network.isConnected && network.isInternetReachable !== false) void reconnect();
      });
    });
    return () => { mounted = false; unsubscribe(); subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!online || snapshot.phase === 'loading' || snapshot.phase === 'error' || connecting.current) return;
    connecting.current = true;
    void controller.reconnect().catch(() => undefined).finally(() => { connecting.current = false; });
  }, [online, snapshot.phase]);

  return <AuthContext.Provider value={{ controller, snapshot, online, verification, setVerification }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required.');
  return context;
}
