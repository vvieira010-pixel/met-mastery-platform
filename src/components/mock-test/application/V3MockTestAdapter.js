import { StartMockTestUseCase } from '../../../core/application/use-cases/start-mock-test.use-case';
import { SubmitMockTestUseCase } from '../../../core/application/use-cases/submit-mock-test.use-case';
import { InMemoryMockTestRepository } from '../../../core/domains/mock-test/repositories/in-memory-mock-test.repository';
import { MockTestScoringService } from '../../../core/domains/mock-test/services/mock-test-scoring.service';

// This adapter connects the existing UI components to the V3 Core Implementation
export class V3MockTestAdapter {
  constructor() {
    // Initialize the V3 Core Implementation dependencies
    const repository = new InMemoryMockTestRepository();
    const scoringService = new MockTestScoringService();
    
    this.startUseCase = new StartMockTestUseCase(repository);
    this.submitUseCase = new SubmitMockTestUseCase(repository, scoringService);
  }

  async startMockTest(studentId, testType) {
    try {
      const mockTest = await this.startUseCase.execute(studentId, testType);
      return {
        id: mockTest.id.value,
        studentId: mockTest.studentId,
        testType: mockTest.type.value,
        status: mockTest.status.value,
        startedAt: mockTest.startedAt
      };
    } catch (error) {
      console.error('Failed to start mock test:', error);
      throw error;
    }
  }

  async submitMockTest(mockTestId, answers) {
    try {
      const mockTest = await this.submitUseCase.execute(mockTestId, answers);
      return {
        id: mockTest.id.value,
        scores: mockTest.scores,
        cefr: mockTest.cefr,
        completedAt: mockTest.completedAt
      };
    } catch (error) {
      console.error('Failed to submit mock test:', error);
      throw error;
    }
  }
}