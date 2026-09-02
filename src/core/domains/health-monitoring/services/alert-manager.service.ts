import { Diagnosis } from '../entities/diagnosis.entity';
import { IDiagnosisRepository } from '../repositories/diagnosis.repository';

export interface Alert {
  id: string;
  studentId: string;
  type: 'missing-baseline' | 'stagnant-progress' | 'regression-detected' | 'homework-overdue' | 'no-recent-session';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: Date;
  acknowledgedAt: Date | null;
}

export class AlertManager {
  private alerts: Alert[] = [];
  private diagnosisRepository: IDiagnosisRepository;

  constructor(diagnosisRepository: IDiagnosisRepository) {
    this.diagnosisRepository = diagnosisRepository;
  }

  async checkAndGenerateAlerts(studentId: string): Promise<Alert[]> {
    const newAlerts: Alert[] = [];
    
    // Check for missing baseline
    const baselineAlert = await this.checkMissingBaseline(studentId);
    if (baselineAlert) newAlerts.push(baselineAlert);

    // Check for stagnant progress
    const stagnantAlert = await this.checkStagnantProgress(studentId);
    if (stagnantAlert) newAlerts.push(stagnantAlert);

    // Check for regression
    const regressionAlert = await this.checkRegression(studentId);
    if (regressionAlert) newAlerts.push(regressionAlert);

    // Check for overdue homework
    const homeworkAlert = await this.checkOverdueHomework(studentId);
    if (homeworkAlert) newAlerts.push(homeworkAlert);

    // Check for no recent session
    const sessionAlert = await this.checkNoRecentSession(studentId);
    if (sessionAlert) newAlerts.push(sessionAlert);

    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  private async checkMissingBaseline(studentId: string): Promise<Alert | null> {
    const diagnoses = await this.diagnosisRepository.findByStudentId(studentId);
    const hasBaseline = diagnoses.some(d => d.isBaseline);
    
    if (!hasBaseline) {
      return {
        id: crypto.randomUUID(),
        studentId,
        type: 'missing-baseline',
        severity: 'critical',
        message: 'Student has no baseline diagnosis. A baseline assessment is required to track progress.',
        createdAt: new Date(),
        acknowledgedAt: null
      };
    }
    return null;
  }

  private async checkStagnantProgress(studentId: string): Promise<Alert | null> {
    const diagnoses = await this.diagnosisRepository.findByStudentId(studentId);
    const recent = diagnoses.filter(d => {
      const daysSince = (Date.now() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    if (recent.length >= 2) {
      // Simple check: if last 2 diagnoses show no improvement in weaknesses count
      const latest = recent[0];
      const previous = recent[1];
      
      if (latest.weaknesses.length >= previous.weaknesses.length &&
          latest.grammarIssues.length >= previous.grammarIssues.length) {
        return {
          id: crypto.randomUUID(),
          studentId,
          type: 'stagnant-progress',
          severity: 'warning',
          message: 'No improvement detected in recent diagnoses. Consider adjusting intervention strategy.',
          createdAt: new Date(),
          acknowledgedAt: null
        };
      }
    }
    return null;
  }

  private async checkRegression(studentId: string): Promise<Alert | null> {
    const diagnoses = await this.diagnosisRepository.findByStudentId(studentId);
    if (diagnoses.length < 3) return null;

    const latest = diagnoses[0];
    const threeAgo = diagnoses[2];

    // Check if issues have increased
    const totalIssuesLatest = latest.grammarIssues.length + latest.vocabularyIssues.length + latest.skillIssues.length;
    const totalIssuesThreeAgo = threeAgo.grammarIssues.length + threeAgo.vocabularyIssues.length + threeAgo.skillIssues.length;

    if (totalIssuesLatest > totalIssuesThreeAgo * 1.5) {
      return {
        id: crypto.randomUUID(),
        studentId,
        type: 'regression-detected',
        severity: 'critical',
        message: 'Significant increase in language issues detected compared to 3 diagnoses ago.',
        createdAt: new Date(),
        acknowledgedAt: null
      };
    }
    return null;
  }

  private async checkOverdueHomework(studentId: string): Promise<Alert | null> {
    // This would need IHomeworkRepository - placeholder for now
    return null;
  }

  private async checkNoRecentSession(studentId: string): Promise<Alert | null> {
    // This would need ISessionRepository - placeholder for now
    return null;
  }

  getAlerts(studentId: string): Alert[] {
    return this.alerts.filter(a => a.studentId === studentId);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedAt = new Date();
    }
  }

  getUnacknowledgedAlerts(studentId: string): Alert[] {
    return this.alerts.filter(a => a.studentId === studentId && !a.acknowledgedAt);
  }
}