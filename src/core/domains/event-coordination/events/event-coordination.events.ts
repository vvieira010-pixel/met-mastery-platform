import { createDomainEvent } from '../../../../shared/domain-events/domain-event-bus';

export const MessageSentEvent = (aggregateId: string, toId: string, toRole: string, subject: string, priority: string) =>
  createDomainEvent('MessageSentEvent', aggregateId, { toId, toRole, subject, priority });

export const MessageReadEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('MessageReadEvent', aggregateId, { studentId });

export const MessageDeletedEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('MessageDeletedEvent', aggregateId, { studentId });

export const NotificationPermissionChangedEvent = (aggregateId: string, studentId: string, granted: boolean) =>
  createDomainEvent('NotificationPermissionChangedEvent', aggregateId, { studentId, granted });