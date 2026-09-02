import { createDomainEvent } from '../../../../shared/domain-events/domain-event-bus';

export const DiagnosisCreatedEvent = (aggregateId: string, studentId: string, isBaseline: boolean, interventionNote: string) =>
  createDomainEvent('DiagnosisCreatedEvent', aggregateId, { studentId, isBaseline, interventionNote });

export const DiagnosisUpdatedEvent = (aggregateId: string, studentId: string, changes: Record<string, any>) =>
  createDomainEvent('DiagnosisUpdatedEvent', aggregateId, { studentId, changes });

export const FeedbackCreatedEvent = (aggregateId: string, studentId: string, diagnosisId: string, status: string) =>
  createDomainEvent('FeedbackCreatedEvent', aggregateId, { studentId, diagnosisId, status });

export const FeedbackReviewedEvent = (aggregateId: string, studentId: string, teacherId: string, score: number | null) =>
  createDomainEvent('FeedbackReviewedEvent', aggregateId, { studentId, teacherId, score });

export const ReportGeneratedEvent = (aggregateId: string, studentId: string, type: string, diagnosisCount: number) =>
  createDomainEvent('ReportGeneratedEvent', aggregateId, { studentId, type, diagnosisCount });

export const ProgressNoteAddedEvent = (aggregateId: string, studentId: string, sourceType: string, sourceId: string | null) =>
  createDomainEvent('ProgressNoteAddedEvent', aggregateId, { studentId, sourceType, sourceId });

export const AlertTriggeredEvent = (aggregateId: string, studentId: string, alertType: string, severity: string, message: string) =>
  createDomainEvent('AlertTriggeredEvent', aggregateId, { studentId, alertType, severity, message });