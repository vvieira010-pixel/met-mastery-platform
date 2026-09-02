/**
 * @graphify:node exercises_deep_research_report_cefr_b2_alignment
 * @graphify:edge -> exercises_deep_research_report_cefr_b2_alignment implements EXTRACTED
 */
import { ValueObject } from '../../../../shared/domain/value-object';

/** MET scope: A2–C1 only (no A1, no C2) */
export type BandLevel = 'A2' | 'B1' | 'B2' | 'C1';

export class BandLevelVO extends ValueObject<BandLevel> {
  private constructor(value: BandLevel) {
    super({ value });
  }

  static A2(): BandLevelVO { return new BandLevelVO('A2'); }
  static B1(): BandLevelVO { return new BandLevelVO('B1'); }
  static B2(): BandLevelVO { return new BandLevelVO('B2'); }
  static C1(): BandLevelVO { return new BandLevelVO('C1'); }

  static fromString(value: string): BandLevelVO {
    const validLevels: BandLevel[] = ['A2', 'B1', 'B2', 'C1'];
    if (!validLevels.includes(value as BandLevel)) {
      throw new Error(`Invalid band level: ${value}. MET scope is A2–C1.`);
    }
    return new BandLevelVO(value as BandLevel);
  }

  get value(): BandLevel {
    return this.props.value;
  }

  get numericValue(): number {
    const levelMap: Record<BandLevel, number> = {
      A2: 2, B1: 3, B2: 4, C1: 5
    };
    return levelMap[this.value];
  }

  isAtLeast(other: BandLevelVO): boolean {
    return this.numericValue >= other.numericValue;
  }

  isBelow(other: BandLevelVO): boolean {
    return this.numericValue < other.numericValue;
  }
}