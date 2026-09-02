import { ValueObject } from '../../../shared/domain/value-object';

export class SubmissionId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): SubmissionId {
    return new SubmissionId(crypto.randomUUID());
  }

  static fromString(id: string): SubmissionId {
    if (!id || id.length === 0) {
      throw new Error('SubmissionId cannot be empty');
    }
    return new SubmissionId(id);
  }

  get value(): string {
    return this.props.value;
  }
}