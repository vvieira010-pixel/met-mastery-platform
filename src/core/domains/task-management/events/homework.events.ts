import { createDomainEvent } from '../../../shared/domain-events/domain-event-bus';

export const HomeworkAssignedEvent = (aggregateId: string, studentId: string, diagnosisId: string | null, title: string) =>
  createDomainEvent('HomeworkAssignedEvent', aggregateId, { studentId, diagnosisId, title });

export const HomeworkSubmittedEvent = (aggregateId: string, submissionId: string, studentId: string, content: string, responses: any, confidence: number | null) =>
  createDomainEvent('HomeworkSubmittedEvent', aggregateId, { submissionId, studentId, content, responses, confidence });

export const HomeworkReviewedEvent = (aggregateId: string, studentId: string, teacherId: string, corrections: any[], overallNote: string, score: number | null) =>
  createDomainEvent('HomeworkReviewedEvent', aggregateId, { studentId, teacherId, corrections, overallNote, score });

export const HomeworkCompletedEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('HomeworkCompletedEvent', aggregateId, { studentId });

export const HomeworkCorrectedEvent = (aggregateId: string, studentId: string) =>
  createDomainEvent('HomeworkCorrectedEvent', aggregateId, { studentId });

export const PracticeAssignmentCreatedEvent = (aggregateId: string, studentId: string, diagnosisId: string | null, resourceIds: string[], skillFocus: string) =>
  createDomainEvent('PracticeAssignmentCreatedEvent', aggregateId, { studentId, diagnosisId, resourceIds, skillFocus });

export const PracticeSubmissionSubmittedEvent = (aggregateId: string, assignmentId: string, studentId: string, answer: string) =>
  createDomainEvent('PracticeSubmissionSubmittedEvent', aggregateId, { assignmentId, studentId, answer });