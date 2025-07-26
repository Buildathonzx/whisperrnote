// Notification utilities for ICP integration (optional)
// Adapted from whisperrnote_icp/frontend/src/store/notifications.ts

export type Notification = {
  type: 'error' | 'info' | 'success';
  message: string;
  id: number;
};

let nextId = 0;

export function addNotification(
  notifications: Notification[],
  notification: Omit<Notification, 'id'>,
  timeout = 2000
): Notification[] {
  const id = nextId++;
  const newNotifications = [...notifications, { ...notification, id }];
  setTimeout(() => {
    // In a real app, you would update state here
  }, timeout);
  return newNotifications;
}

export function showError(e: any, message: string): never {
  // In a real app, you would show a notification
  console.error(message, e);
  throw e;
}
