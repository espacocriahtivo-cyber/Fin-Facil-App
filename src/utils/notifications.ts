import { Transaction, PendingAlert } from '../types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function sendPushNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

export function calculatePendingAlerts(transactions: Transaction[]): PendingAlert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pending = transactions.filter(t => t.status === 'pending');
  const alerts: PendingAlert[] = [];

  for (const t of pending) {
    const targetDateStr = t.dueDate || t.date;
    if (!targetDateStr) continue;

    const [year, month, day] = targetDateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      alerts.push({
        transaction: t,
        status: 'overdue',
        daysDiff
      });
    } else if (daysDiff === 0) {
      alerts.push({
        transaction: t,
        status: 'due_today',
        daysDiff: 0
      });
    } else if (daysDiff <= 3) {
      alerts.push({
        transaction: t,
        status: 'due_soon',
        daysDiff
      });
    }
  }

  // Sort by urgency: overdue first (most negative diff), then due_today, then due_soon
  return alerts.sort((a, b) => a.daysDiff - b.daysDiff);
}

export function notifyPendingBillsIfAllowed(alerts: PendingAlert[]): void {
  if (alerts.length === 0 || getNotificationPermission() !== 'granted') return;

  const overdueCount = alerts.filter(a => a.status === 'overdue').length;
  const todayCount = alerts.filter(a => a.status === 'due_today').length;
  const soonCount = alerts.filter(a => a.status === 'due_soon').length;

  let body = '';
  if (overdueCount > 0) {
    body += `⚠️ ${overdueCount} conta(s) em atraso! `;
  }
  if (todayCount > 0) {
    body += `🔔 ${todayCount} conta(s) vencem hoje! `;
  }
  if (soonCount > 0 && overdueCount === 0 && todayCount === 0) {
    body += `📅 ${soonCount} conta(s) a vencer nos próximos 3 dias.`;
  }

  const title = 'Fin Fácil App: Lembrete de Pagamento';
  sendPushNotification(title, {
    body: body.trim(),
    tag: 'finfacil-bills-reminder'
  });
}
