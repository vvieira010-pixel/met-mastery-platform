import { Cohort } from '../entities/cohort.entity';
import { CohortId } from '../value-objects/cohort-id.vo';

export interface ICohortRepository {
  save(cohort: Cohort): Promise<void>;
  findById(id: CohortId): Promise<Cohort | null>;
  findAll(): Promise<Cohort[]>;
  findByTeacher(teacherId: string): Promise<Cohort[]>;
  findActive(): Promise<Cohort[]>;
  findByTrack(track: string): Promise<Cohort[]>;
  delete(id: CohortId): Promise<void>;
}