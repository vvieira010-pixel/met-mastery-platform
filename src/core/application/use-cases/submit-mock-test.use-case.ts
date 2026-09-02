import { MockTest } from '../../domains/mock-test/entities/mock-test.entity';
import { IMockTestRepository } from '../../domains/mock-test/repositories/mock-test.repository';
import { MockTestId } from '../../domains/mock-test/value-objects/mock-test-id.vo';
import { MockTestScoringService } from '../../domains/mock-test/services/mock-test-scoring.service';

export class SubmitMockTestUseCase {
  constructor(
    private mockTestRepository: IMockTestRepository,
    private scoringService: MockTestScoringService
  ) {}

  async execute(mockTestId: string, answers: Record<string, any>): Promise<MockTest> {
    // Validate inputs
    if (!mockTestId) {
      throw new Error('Mock test ID is required');
    }
    if (!answers) {
      throw new Error('Answers are required');
    }

    // Find the mock test
    const id = MockTestId.fromString(mockTestId);
    const mockTest = await this.mockTestRepository.findById(id);
    
    if (!mockTest) {
      throw new Error(`Mock test with ID ${mockTestId} not found`);
    }

    // Calculate scores and CEFR
    const scores = this.scoringService.calculateScores(answers);
    const cefr = this.scoringService.calculateCefr(scores);

    // Submit the mock test
    mockTest.submit(answers, scores, cefr);

    // Save to repository
    await this.mockTestRepository.save(mockTest);

    return mockTest;
  }
}
