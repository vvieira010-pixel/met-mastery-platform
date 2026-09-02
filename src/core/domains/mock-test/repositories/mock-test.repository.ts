import { MockTest } from '../entities/mock-test.entity';
import { MockTestId } from '../value-objects/mock-test-id.vo';

export interface IMockTestRepository {
  save(mockTest: MockTest): Promise<void>;
  findById(id: MockTestId): Promise<MockTest | null>;
  findByStudentId(studentId: string): Promise<MockTest[]>;
  findCompletedTestsByStudentId(studentId: string): Promise<MockTest[]>;
  delete(id: MockTestId): Promise<void>;
}