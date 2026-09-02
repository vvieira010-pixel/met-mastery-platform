import { MockTestScoringService } from '../services/mock-test-scoring.service';

// Mock the external scoring functions
jest.mock('../../../../lib/mock-test-scoring', () => ({
  scoreReading: jest.fn(() => ({ total: 50, max: 60, details: [] })),
  scoreListening: jest.fn(() => ({ total: 40, max: 40, details: [] }))
}));

describe('MockTestScoringService', () => {
  let scoringService: MockTestScoringService;

  beforeEach(() => {
    scoringService = new MockTestScoringService();
  });

  describe('calculateScores', () => {
    it('should calculate reading and listening scores', () => {
      const answers = { q1: 'A' };
      const scores = scoringService.calculateScores(answers);

      expect(scores).toEqual({
        reading: { total: 50, max: 60, details: [] },
        listening: { total: 40, max: 40, details: [] },
        total: 90,
        max: 100
      });
    });
  });

  describe('calculateCefr', () => {
    it('should return C2 for high scores', () => {
      const scores = { total: 95, max: 100 };
      const cefr = scoringService.calculateCefr(scores);
      expect(cefr).toBe('C2');
    });

    it('should return A1 for low scores', () => {
      const scores = { total: 30, max: 100 };
      const cefr = scoringService.calculateCefr(scores);
      expect(cefr).toBe('A1');
    });
  });
});