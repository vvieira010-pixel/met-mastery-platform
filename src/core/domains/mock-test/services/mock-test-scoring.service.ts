/**
 * @graphify:node exercises_deep_research_report_core_met_layer
 * @graphify:edge -> exercises_deep_research_report_core_met_layer implements EXTRACTED
 * @graphify:node exercises_deep_research_report_cefr_b2_alignment
 * @graphify:edge -> exercises_deep_research_report_cefr_b2_alignment implements EXTRACTED
 */
import { MockTest } from '../entities/mock-test.entity';
import { scoreReading, scoreListening } from '../../../../lib/mock-test-scoring';
import { computeScaledScores, ScaledScores, SectionScore } from '../../../../lib/met-scoring';

export class MockTestScoringService {
  public calculateScores(answers: Record<string, any>): Record<string, any> {
    const readingScore = scoreReading(answers);
    const listeningScore = scoreListening(answers);
    
    return {
      reading: readingScore,
      listening: listeningScore,
      total: readingScore.total + listeningScore.total,
      max: readingScore.max + listeningScore.max
    };
  }

  /**
   * Calculate official MET scaled scores (0-80) and CEFR band.
   * Replaces the legacy percentage-based calculateCefr.
   */
  public calculateScaledScores(answers: Record<string, any>): ScaledScores {
    const readingScore = scoreReading(answers);
    const listeningScore = scoreListening(answers);
    
    const sections: { reading?: SectionScore; listening?: SectionScore } = {
      reading: readingScore,
      listening: listeningScore,
    };
    
    return computeScaledScores(sections);
  }

  /**
   * @deprecated Use calculateScaledScores instead. Kept for backward compatibility only.
   * Returns percentage-based CEFR (not official MET scaled).
   */
  public calculateCefr(scores: Record<string, any>): string {
    const total = scores.total;
    const max = scores.max;
    const percentage = max > 0 ? (total / max) * 100 : 0;

    // Legacy percentage mapping (not official MET)
    if (percentage >= 85) return 'C2';
    if (percentage >= 75) return 'C1';
    if (percentage >= 65) return 'B2';
    if (percentage >= 55) return 'B1';
    if (percentage >= 45) return 'A2';
    return 'A1';
  }
}
