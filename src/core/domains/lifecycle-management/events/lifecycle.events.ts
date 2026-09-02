import { createDomainEvent } from '../../../../shared/domain-events/domain-event-bus';

export const StudentCreatedEvent = (aggregateId: string, email: string, cohort: string, track: string) =>
  createDomainEvent('StudentCreatedEvent', aggregateId, { email, cohort, track });

export const StudentUpdatedEvent = (aggregateId: string, changes: Record<string, any>) =>
  createDomainEvent('StudentUpdatedEvent', aggregateId, { changes });

export const StudentCohortChangedEvent = (aggregateId: string, oldCohort: string, newCohort: string) =>
  createDomainEvent('StudentCohortChangedEvent', aggregateId, { oldCohort, newCohort });

export const StudentTargetProfileActivatedEvent = (aggregateId: string, profileId: string, profileName: string) =>
  createDomainEvent('StudentTargetProfileActivatedEvent', aggregateId, { profileId, profileName });

export const CohortCreatedEvent = (aggregateId: string, teacherId: string, name: string, track: string) =>
  createDomainEvent('CohortCreatedEvent', aggregateId, { teacherId, name, track });

export const CohortActivatedEvent = (aggregateId: string, teacherId: string, studentCount: number) =>
  createDomainEvent('CohortActivatedEvent', aggregateId, { teacherId, studentCount });

export const CohortCompletedEvent = (aggregateId: string) =>
  createDomainEvent('CohortCompletedEvent', aggregateId, {});

export const TargetProfileCreatedEvent = (aggregateId: string, studentId: string, profileName: string) =>
  createDomainEvent('TargetProfileCreatedEvent', aggregateId, { studentId, profileName });

export const TargetProfileActivatedEvent = (aggregateId: string, studentId: string, profileId: string) =>
  createDomainEvent('TargetProfileActivatedEvent', aggregateId, { studentId, profileId });