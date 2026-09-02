import { ValueObject } from '../../../../shared/domain/value-object';

export class CohortId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): CohortId {
    return new CohortId(crypto.randomUUID());
  }

  static fromString(id: string): CohortId {
    if (!id || id.length === 0) {
      throw new Error('CohortId cannot be empty');
    }
    return new CohortId(id);
  }

  get value(): string {
    return this.props.value;
  }
}