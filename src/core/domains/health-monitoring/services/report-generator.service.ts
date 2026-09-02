import { Report } from '../entities/report.entity';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Feedback } from '../entities/feedback.entity';
import { Homework } from '../../task-management/entities/homework.entity';
import { IReportRepository } from '../repositories/report.repository';
import { IDiagnosisRepository } from '../repositories/diagnosis.repository';
import { IFeedbackRepository } from '../repositories/feedback.repository';
import { IHomeworkRepository } from '../../task-management/repositories/homework.repository';

export class ReportGenerator {
  constructor(
    private reportRepository: IReportRepository,
    private diagnosisRepository: IDiagnosisRepository,
    private feedbackRepository: IFeedbackRepository,
    private homeworkRepository: IHomeworkRepository
  ) {}

  async generateProgressReport(studentId: string): Promise<Report> {
    const [diagnoses, feedback, homework] = await Promise.all([
      this.diagnosisRepository.findByStudentId(studentId),
      this.feedbackRepository.findByStudentId(studentId),
      this.homeworkRepository.findByStudentId(studentId)
    ]);

    const content = this.buildProgressReportContent(diagnoses, feedback, homework);
    
    const report = Report.create(
      studentId,
      diagnoses.map(d => d.id.value),
      feedback.map(f => f.id.value),
      homework.map(h => h.id.value),
      content,
      'progress'
    );

    await this.reportRepository.save(report);
    return report;
  }

  async generateDiagnosticReport(studentId: string, diagnosisId: string): Promise<Report> {
    const diagnosis = await this.diagnosisRepository.findById(
      { value: diagnosisId } as any
    );
    
    if (!diagnosis) {
      throw new Error('Diagnosis not found');
    }

    const feedback = await this.feedbackRepository.findByDiagnosisId(diagnosisId);
    
    const content = this.buildDiagnosticReportContent(diagnosis, feedback);
    
    const report = Report.create(
      studentId,
      [diagnosisId],
      feedback.map(f => f.id.value),
      [],
      content,
      'diagnostic'
    );

    await this.reportRepository.save(report);
    return report;
  }

  async generateSessionSummaryReport(studentId: string, sessionId: string): Promise<Report> {
    // This would integrate with session-management domain
    const report = Report.create(
      studentId,
      [],
      [],
      [],
      `Session summary for session ${sessionId}`,
      'session-summary'
    );

    await this.reportRepository.save(report);
    return report;
  }

  private buildProgressReportContent(
    diagnoses: Diagnosis[],
    feedback: Feedback[],
    homework: Homework[]
  ): string {
    const latestDiagnosis = diagnoses[0];
    const completedHomework = homework.filter(h => h.status.isCompleted() || h.status.isCorrected());
    const reviewedFeedback = feedback.filter(f => f.status === 'reviewed');

    return `
# Progress Report

## Summary
- Total Diagnoses: ${diagnoses.length}
- Completed Homework: ${completedHomework.length}/${homework.length}
- Feedback Received: ${reviewedFeedback.length}/${feedback.length}

## Latest Diagnosis (${latestDiagnosis?.createdAt.toLocaleDateString()})
${latestDiagnosis ? `
**Strengths:** ${latestDiagnosis.strengths.join(', ') || 'None recorded'}
**Weaknesses:** ${latestDiagnosis.weaknesses.join(', ') || 'None recorded'}
**Grammar Issues:** ${latestDiagnosis.grammarIssues.length}
**Vocabulary Issues:** ${latestDiagnosis.vocabularyIssues.length}
**Skill Issues:** ${latestDiagnosis.skillIssues.length}
` : 'No diagnosis available'}

## Recent Feedback
${reviewedFeedback.slice(0, 5).map(f => `- ${f.overallNote || 'No note'}`).join('\n') || 'No recent feedback'}

## Homework Progress
${completedHomework.map(h => `- ${h.title} (${h.status.value})`).join('\n') || 'No completed homework'}
`.trim();
  }

  private buildDiagnosticReportContent(diagnosis: Diagnosis, feedback: Feedback[]): string {
    return `
# Diagnostic Report

## Diagnosis Details
**Date:** ${diagnosis.createdAt.toLocaleDateString()}
**Type:** ${diagnosis.isBaseline ? 'Baseline' : 'Follow-up'}
**Cycle Stage:** ${diagnosis.cycleStage || 'Unknown'}

## Analysis
**Strengths:** ${diagnosis.strengths.join(', ') || 'None recorded'}
**Weaknesses:** ${diagnosis.weaknesses.join(', ') || 'None recorded'}

### Grammar Issues (${diagnosis.grammarIssues.length})
${diagnosis.grammarIssues.map(g => `- ${g.issue}: ${g.explanation}`).join('\n') || 'None'}

### Vocabulary Issues (${diagnosis.vocabularyIssues.length})
${diagnosis.vocabularyIssues.map(v => `- ${v.issue}: ${v.explanation}`).join('\n') || 'None'}

### Skill Issues (${diagnosis.skillIssues.length})
${diagnosis.skillIssues.map(s => `- ${s.skill}: ${s.description}`).join('\n') || 'None'}

## MET Connections
${diagnosis.metConnections.map(m => `- ${m.skill}: ${m.description}`).join('\n') || 'None'}

## Next Steps
${diagnosis.nextSteps.map(n => `- ${n}`).join('\n') || 'None'}

## Teacher Feedback
${feedback.map(f => `- ${f.overallNote}`).join('\n') || 'No feedback available'}
`.trim();
  }
}