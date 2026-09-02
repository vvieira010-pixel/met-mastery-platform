import { MockTest } from '../entities/mock-test.entity';
import { MockTestId } from '../value-objects/mock-test-id.vo';
import { IMockTestRepository } from './mock-test.repository';

export class InMemoryMockTestRepository implements IMockTestRepository {
  private store: Map<string, MockTest> = new Map();

  async save(mockTest: MockTest): Promise<void> {
    this.store.set(mockTest.id.value, mockTest);
  }

  async findById(id: MockTestId): Promise<MockTest | null> {
    return this.store.get(id.value) || null;
  }

  async findByStudentId(studentId: string): Promise<MockTest[]> {
    const tests: MockTest[] = [];
    for (const test of this.store.values()) {
      if (test.studentId === studentId) {
        tests.push(test);
      }
    }
    return tests;
  }

  async findCompletedTestsByStudentId(studentId: string): Promise<MockTest[]> {
    const tests: MockTest[] = [];
    for (const test of this.store.values()) {
      if (test.studentId === studentId && test.status.isCompleted()) {
        tests.push(test);
      }
    }
    return tests;
  }

  async delete(id: MockTestId): Promise<void> {
    this.store.delete(id.value);
  }
}
