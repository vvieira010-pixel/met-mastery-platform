import { Diagnosis } from '../entities/diagnosis.entity';
import { IDiagnosisRepository } from '../repositories/diagnosis.repository';

export class DiagnosisCollector {
  constructor(private diagnosisRepository: IDiagnosisRepository) {}

  async getStudentDiagnoses(studentId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.findByStudentId(studentId);
  }

  async getLatestDiagnosis(studentId: string): Promise<Diagnosis | null> {
    return this.diagnosisRepository.findLatestByStudentId(studentId);
  }

  async getBaselineDiagnosis(studentId: string): Promise<Diagnosis | null> {
    return this.diagnosisRepository.findBaselineByStudentId(studentId);
  }

  async getDiagnosesBySession(sessionId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.findBySessionId(sessionId);
  }

  async getDiagnosisTimeline(studentId: string): Promise<Diagnosis[]> {
    const diagnoses = await this.diagnosisRepository.findByStudentId(studentId);
    return diagnoses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async hasRecentDiagnosis(studentId: string, days: number = 30): Promise<boolean> {
    const latest = await this.diagnosisRepository.findLatestByStudentId(studentId);
    if (!latest) return false;
    
    const daysSince = (Date.now() - latest.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= days;
  }
}