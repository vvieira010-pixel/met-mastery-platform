import { ValueObject } from '../../../../shared/domain/value-object';

export class ReportId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): ReportId {
    return new ReportId(crypto.randomUUID());
  }

  static fromString(id: string): ReportId {
    if (!id || id.length === 0) {
      throw new Error('ReportId cannot be empty');
    }
    return new ReportId(id);
  }

  get value(): string {
    return this.props.value;
  }
}