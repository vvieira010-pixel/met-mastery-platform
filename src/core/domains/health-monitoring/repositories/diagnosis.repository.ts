import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisId } from '../value-objects/diagnosis-id.vo';

export interface IDiagnosisRepository {
  save(diagnosis: Diagnosis): Promise<void>;
  findById(id: DiagnosisId): Promise<Diagnosis | null>;
  findByStudentId(studentId: string): Promise<Diagnosis[]>;
  findLatestByStudentId(studentId: string): Promise<Diagnosis | null>;
  findBySessionId(sessionId: string): Promise<Diagnosis[]>;
  findByClassEventId(classEventId: string): Promise<Diagnosis[]>;
  delete(id: DiagnosisId): Promise<void>;
}