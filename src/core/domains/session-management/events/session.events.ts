import { createDomainEvent } from '../../../../shared/domain-events/domain-event-bus';

export const SessionCreatedEvent = (aggregateId: string, studentId: string, teacherId: string, date: Date) =>
  createDomainEvent('SessionCreatedEvent', aggregateId, { studentId, teacherId, date: date.toISOString() });

export const SessionStartedEvent = (aggregateId: string, studentId: string, teacherId: string) =>
  createDomainEvent('SessionStartedEvent', aggregateId, { studentId, teacherId });

export const SessionCompletedEvent = (aggregateId: string, studentId: string, teacherId: string, notes: string) =>
  createDomainEvent('SessionCompletedEvent', aggregateId, { studentId, teacherId, notes });

export const SessionCancelledEvent = (aggregateId: string, studentId: string, teacherId: string) =>
  createDomainEvent('SessionCancelledEvent', aggregateId, { studentId, teacherId });

export const ClassEventCreatedEvent = (aggregateId: string, studentId: string, date: Date, title: string) =>
  createDomainEvent('ClassEventCreatedEvent', aggregateId, { studentId, date: date.toISOString(), title });

export const ClassEventCompletedEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('ClassEventCompletedEvent', aggregateId, { studentId });

export const ClassEventCancelledEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('ClassEventCancelledEvent', aggregateId, { studentId });

export const DiagnosticStatusChangedEvent = (aggregateId: string, studentId: string, oldStatus: string, newStatus: string) =>
  createDomainEvent('DiagnosticStatusChangedEvent', aggregateId, { studentId, oldStatus, newStatus });

export const HomeworkStatusChangedEvent = (aggregateId: string, studentId: string, oldStatus: string, newStatus: string) =>
  createDomainEvent('HomeworkStatusChangedEvent', aggregateId, { studentId, oldStatus, newStatus });