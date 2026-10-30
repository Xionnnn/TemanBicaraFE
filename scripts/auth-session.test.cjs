const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SessionController, isStoredSession } = require('../src/auth/session.ts');

const a = { credential: 'credential-a', account: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', username: 'A', role: 'Student' } };
const b = { credential: 'credential-b', account: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', username: 'B', role: 'Teacher' } };
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function fixture(initial = { active: null, pendingRevocations: [] }) {
  let saved = structuredClone(initial);
  const opened = [], closed = [], revoked = [];
  const deps = {
    load: async () => structuredClone(saved),
    save: async value => { saved = structuredClone(value); },
    open: async id => { opened.push(id); return { database: { closeAsync: async () => { closed.push(id); } } }; },
    revoke: async credential => { revoked.push(credential); },
    me: async credential => credential === a.credential ? a.account : b.account,
    isUnauthorized: error => error?.status === 401,
  };
  return { deps, opened, closed, revoked, saved: () => saved, create: () => new SessionController(deps) };
}

test('restores the verified account locally without network access', async () => {
  const f = fixture({ active: a, pendingRevocations: [] });
  f.deps.me = async () => { throw new Error('offline'); };
  const controller = f.create();
  await controller.restore();
  assert.equal(controller.getSnapshot().phase, 'signedIn');
  assert.deepEqual(f.opened, [a.account.id]);
  await assert.rejects(controller.reconnect());
  assert.equal(controller.getSnapshot().account.id, a.account.id);
  assert.equal(f.closed.length, 0);
});

test('logout persists revocation and clears active identity before any network call', async () => {
  const f = fixture({ active: a, pendingRevocations: [] });
  const controller = f.create();
  await controller.restore();
  f.deps.revoke = async credential => {
    assert.equal(credential, a.credential);
    assert.equal(f.saved().active, null);
    assert.deepEqual(f.closed, [a.account.id]);
    throw new Error('offline');
  };
  await controller.logout();
  assert.equal(controller.getSnapshot().phase, 'signedOut');
  assert.deepEqual(f.saved().pendingRevocations, [a]);
  const restarted = f.create();
  await restarted.restore();
  f.deps.revoke = async credential => { f.revoked.push(credential); };
  await restarted.reconnect();
  assert.deepEqual(f.revoked, [a.credential]);
  assert.deepEqual(f.saved().pendingRevocations, []);
});

test('pending revocations use the old account credential before a different login', async () => {
  const f = fixture({ active: null, pendingRevocations: [a] });
  const controller = f.create();
  await controller.restore();
  await controller.signIn(async () => { assert.deepEqual(f.revoked, [a.credential]); return b; });
  assert.equal(controller.getSnapshot().account.id, b.account.id);
  assert.deepEqual(f.opened, [b.account.id]);
});

test('failed revocation blocks a new login and preserves pending work', async () => {
  const f = fixture({ active: null, pendingRevocations: [a] });
  f.deps.revoke = async () => { throw new Error('offline'); };
  const controller = f.create();
  await controller.restore();
  let called = false;
  await assert.rejects(controller.signIn(async () => { called = true; return b; }));
  assert.equal(called, false);
  assert.deepEqual(f.saved().pendingRevocations, [a]);
});

test('logout cancels a late login response without opening or storing that account', async () => {
  const f = fixture();
  const controller = f.create();
  await controller.restore();
  const response = deferred(), started = deferred();
  const login = controller.signIn(async () => { started.resolve(); return response.promise; });
  await started.promise;
  const logout = controller.logout();
  response.resolve(a);
  await assert.rejects(login, /canceled/);
  await logout;
  assert.equal(f.saved().active, null);
  assert.equal(f.opened.length, 0);
});

test('revoked credentials block online access while retaining the local account', async () => {
  const f = fixture({ active: a, pendingRevocations: [] });
  f.deps.me = async () => { throw { status: 401 }; };
  const controller = f.create();
  await controller.restore();
  await assert.rejects(controller.reconnect());
  assert.equal(controller.getSnapshot().onlineAccess, 'blocked');
  assert.equal(controller.getSnapshot().account.id, a.account.id);
  assert.equal(f.closed.length, 0);
});

test('late account validation cannot restore UI after logout', async () => {
  const f = fixture({ active: a, pendingRevocations: [] });
  const result = deferred(), started = deferred();
  f.deps.me = async () => { started.resolve(); return result.promise; };
  const controller = f.create();
  await controller.restore();
  const reconnect = controller.reconnect();
  await started.promise;
  const logout = controller.logout();
  result.resolve(a.account);
  await reconnect;
  await logout;
  assert.equal(controller.getSnapshot().phase, 'signedOut');
  assert.equal(f.saved().active, null);
});

test('database errors stop restoration; account switching closes the previous database', async () => {
  const f = fixture({ active: a, pendingRevocations: [] });
  const controller = f.create();
  await controller.restore();
  await controller.signIn(async () => b);
  assert.deepEqual(f.closed, [a.account.id]);
  assert.deepEqual(f.opened, [a.account.id, b.account.id]);
  f.deps.open = async () => { throw new Error('disk unavailable'); };
  await assert.rejects(controller.signIn(async () => a));
  assert.equal(controller.getSnapshot().phase, 'error');
  assert.equal(controller.getSnapshot().account, null);
});

test('already revoked credentials leave the queue and invalid identity data is rejected', async () => {
  const f = fixture({ active: null, pendingRevocations: [a] });
  f.deps.revoke = async () => { throw { status: 401 }; };
  const controller = f.create();
  await controller.restore(); await controller.reconnect();
  assert.deepEqual(f.saved().pendingRevocations, []);
  assert.equal(isStoredSession({ ...a, account: { ...a.account, id: '../other-profile' } }), false);
  assert.equal(isStoredSession({ ...a, account: { ...a.account, role: 'Admin' } }), false);
});
