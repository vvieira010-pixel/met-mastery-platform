import { BaseDomain } from '../../../kernel/domain';
import { DependencyContainer } from '../../../shared/types/plugin';
import { MockTestScoringService } from './services/mock-test-scoring.service';
import { MockTestStartedEvent } from './events/mock-test-started.event';
import { MockTestCompletedEvent } from './events/mock-test-completed.event';

export class MockTestDomain extends BaseDomain {
  name = 'mock-test';

  private scoringService: MockTestScoringService | null = null;

  async initialize(container: DependencyContainer): Promise<void> {
    await super.initialize(container);

    this.scoringService = new MockTestScoringService();

    console.log('[MockTestDomain] Initialized');
  }

  getScoringService(): MockTestScoringService | null {
    return this.scoringService;
  }

  protected async registerDependencies(container: DependencyContainer): Promise<void> {
    container.register(Symbol.for('MockTestScoringService'), MockTestScoringService);
  }

  eventHandlers = {
    'MockTestStartedEvent': [this.handleMockTestStarted.bind(this)],
    'MockTestCompletedEvent': [this.handleMockTestCompleted.bind(this)]
  };

  private async handleMockTestStarted(event: any): Promise<void> {
    console.log(`[MockTestDomain] Mock test started: ${event.testType} for student ${event.studentId}`);
  }

  private async handleMockTestCompleted(event: any): Promise<void> {
    console.log(`[MockTestDomain] Mock test completed for student ${event.studentId} (CEFR: ${event.cefr ?? 'pending'})`);
  }
}

export const mockTestDomain = new MockTestDomain();
