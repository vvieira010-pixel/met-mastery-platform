import { MockTest } from '../../domains/mock-test/entities/mock-test.entity';
import { MockTestType } from '../../domains/mock-test/value-objects/mock-test-type.vo';
import { IMockTestRepository } from '../../domains/mock-test/repositories/mock-test.repository';

export class StartMockTestUseCase {
  constructor(
    private mockTestRepository: IMockTestRepository
  ) {}

  async execute(studentId: string, testType: string): Promise<MockTest> {
    // Validate inputs
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    // Create mock test based on type
    let mockTestType: MockTestType;
    switch (testType) {
      case 'mock-test-1':
        mockTestType = MockTestType.mockTest1();
        break;
      case 'mock-test-2':
        mockTestType = MockTestType.mockTest2();
        break;
      case 'mock-test-3':
        mockTestType = MockTestType.mockTest3();
        break;
      default:
        throw new Error('Invalid mock test type');
    }

    // Create and start the mock test
    const mockTest = MockTest.create(studentId, mockTestType);
    mockTest.start();

    // Save to repository
    await this.mockTestRepository.save(mockTest);

    return mockTest;
  }
}
