import { MockTest } from '../entities/mock-test.entity';
import { MockTestType } from '../value-objects/mock-test-type.vo';

describe('MockTest Entity', () => {
  let mockTest: MockTest;

  beforeEach(() => {
    mockTest = MockTest.create('student-123', MockTestType.mockTest1());
  });

  describe('creation', () => {
    it('should create mock test with not started status', () => {
      expect(mockTest.status.isNotStarted()).toBe(true);
      expect(mockTest.studentId).toBe('student-123');
      expect(mockTest.type.isMockTest1()).toBe(true);
    });

    it('should generate unique ID', () => {
      const mockTest1 = MockTest.create('student-1', MockTestType.mockTest1());
      const mockTest2 = MockTest.create('student-2', MockTestType.mockTest1());

      expect(mockTest1.id.equals(mockTest2.id)).toBe(false);
    });
  });

  describe('starting', () => {
    it('should start and change status to in progress', () => {
      mockTest.start();

      expect(mockTest.status.isInProgress()).toBe(true);
      expect(mockTest.startedAt).toBeDefined();
    });

    it('should emit MockTestStartedEvent when started', () => {
      mockTest.start();

      const events = mockTest.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty('mockTestId');
      expect(events[0]).toHaveProperty('studentId');
    });

    it('should not allow starting completed mock test', () => {
      // Start and complete the test
      mockTest.start();
      mockTest.submit({}, { total: 100, max: 100 }, 'B2');

      expect(() => mockTest.start())
        .toThrow('Cannot start completed mock test');
    });
  });

  describe('submission', () => {
    it('should submit answers and scores', () => {
      const answers = { q1: 'A', q2: 'B' };
      const scores = { total: 85, max: 100 };

      mockTest.start();
      mockTest.submit(answers, scores, 'B2');

      expect(mockTest.answers).toEqual(answers);
      expect(mockTest.scores).toEqual(scores);
      expect(mockTest.cefr).toBe('B2');
      expect(mockTest.status.isCompleted()).toBe(true);
    });

    it('should not allow submitting unstarted mock test', () => {
      expect(() => mockTest.submit({}, { total: 100, max: 100 }, 'B2'))
        .toThrow('Cannot submit unstarted mock test');
    });
  });
});