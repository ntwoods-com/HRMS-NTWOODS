const listeners = new Set();
const queue = [];

/**
 * Push a notification payload from anywhere (including non-React modules).
 * The NotificationsProvider subscribes to this bus and persists them.
 */
export function pushNotification(payload) {
  const n = payload || {};
  if (listeners.size === 0) {
    queue.push(n);
    return;
  }
  for (const cb of listeners) {
    try {
      cb(n);
    } catch {
      // ignore
    }
  }
}

export function subscribeNotifications(cb) {
  if (typeof cb !== 'function') return () => {};
  listeners.add(cb);
  if (queue.length > 0) {
    const copy = queue.splice(0, queue.length);
    for (const n of copy) {
      try {
        cb(n);
      } catch {
        // ignore
      }
    }
  }
  return () => {
    listeners.delete(cb);
  };
}

