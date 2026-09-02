import { Report } from '../entities/report.entity';
import { ReportId } from '../value-objects/report-id.vo';

export interface IReportRepository {
  save(report: Report): Promise<void>;
  findById(id: ReportId): Promise<Report | null>;
  findByStudentId(studentId: string): Promise<Report[]>;
  findByType(studentId: string, type: string): Promise<Report[]>;
  delete(id: ReportId): Promise<void>;
}