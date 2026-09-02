import { K, load, save, uid } from '../lib/workflow-core.js';

export async function getInbox({ role, studentId } = {}) {
  const all = load(K.inbox);
  if (role === 'student' && studentId) return all.filter(m => m.toStudentId === studentId || m.fromStudentId === studentId);
  return all;
}

export function requestInboxNotificationPermission() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
  Notification.requestPermission();
}

export async function sendMessage(data) {
  const all = load(K.inbox);
  const msg = { id: uid(), createdAt: new Date().toISOString(), read: false, ...data };
  all.unshift(msg);
  save(K.inbox, all);
  window.dispatchEvent(new CustomEvent('vv:messages-changed'));
  if (data.fromRole === 'student') {
    const unread = all.filter(m => m.fromRole === 'student' && !m.read).length;
    localStorage.setItem('inboxUnread', String(unread));
    window.dispatchEvent(new CustomEvent('vv:inbox-unread-changed'));
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const sender = data.fromName || 'A student';
      new Notification(`Message from ${sender}`, {
        body: String(data.body || '').slice(0, 100),
        icon: '/favicon.svg',
        tag: 'inbox',
      });
    }
  }
  return msg;
}

export async function markRead(messageId) {
  const all = load(K.inbox);
  const idx = all.findIndex(m => m.id === messageId);
  if (idx >= 0) { all[idx].read = true; save(K.inbox, all); }
}
