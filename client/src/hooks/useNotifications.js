/**
 * Padrão Observer para notificações do UniTreino.
 *
 * NotificationService = Subject (Publisher)
 * useNotifications()  = Observer (qualquer componente que assinar)
 */
import { useState, useEffect } from 'react';

// ── Notificações mock para desenvolvimento ──────────────────────────────────
const MOCK_NOTIFICACOES = [
  {
    id: 1,
    titulo: 'Academia Unifor',
    mensagem: 'Academia está em manutenção, portanto hoje estamos fechados.',
    tipo: 'info',
    lida: false,
    data_envio: new Date().toISOString(),
  },
  {
    id: 2,
    titulo: 'Academia Unifor',
    mensagem: 'Lembrete: seu treino de Upper está agendado para hoje.',
    tipo: 'treino',
    lida: false,
    data_envio: new Date().toISOString(),
  },
  {
    id: 3,
    titulo: 'Academia Unifor',
    mensagem: 'Você está há 3 dias sem treinar. Bora voltar!',
    tipo: 'inatividade',
    lida: true,
    data_envio: new Date().toISOString(),
  },
];

// ── Subject (Singleton) ─────────────────────────────────────────────────────
const NotificationService = (() => {
  let observers = [];
  let state = { notifications: MOCK_NOTIFICACOES };

  return {
    subscribe(observer) {
      observers.push(observer);
    },

    unsubscribe(observer) {
      observers = observers.filter((o) => o !== observer);
    },

    notify() {
      observers.forEach((observer) => observer({ ...state }));
    },

    push(notification) {
      const nova = {
        id: Date.now(),
        titulo: notification.titulo ?? 'Academia Unifor',
        mensagem: notification.mensagem,
        tipo: notification.tipo ?? 'info',
        lida: false,
        data_envio: new Date().toISOString(),
      };
      state = { notifications: [nova, ...state.notifications] };
      this.notify();
    },

    markAsRead(id) {
      state = {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        ),
      };
      this.notify();
    },

    markAllAsRead() {
      state = {
        notifications: state.notifications.map((n) => ({ ...n, lida: true })),
      };
      this.notify();
    },

    getState() {
      return state;
    },
  };
})();

// ── Hook Observer ────────────────────────────────────────────────────────────
export function useNotifications() {
  const [state, setState] = useState(NotificationService.getState());

  useEffect(() => {
    NotificationService.subscribe(setState);
    return () => NotificationService.unsubscribe(setState);
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.lida).length;

  return {
    notifications: state.notifications,
    unreadCount,
    markAsRead:    (id) => NotificationService.markAsRead(id),
    markAllAsRead: ()   => NotificationService.markAllAsRead(),
    push:          (n)  => NotificationService.push(n),
  };
}

export { NotificationService };
