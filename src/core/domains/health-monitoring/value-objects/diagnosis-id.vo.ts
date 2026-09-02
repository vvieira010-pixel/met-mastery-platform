import { ValueObject } from '../../../../shared/domain/value-object';

export class DiagnosisId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): DiagnosisId {
    return new DiagnosisId(crypto.randomUUID());
  }

  static fromString(id: string): DiagnosisId {
    if (!id || id.length === 0) {
      throw new Error('DiagnosisId cannot be empty');
    }
    return new DiagnosisId(id);
  }

  get value(): string {
    return this.props.value;
  }
}