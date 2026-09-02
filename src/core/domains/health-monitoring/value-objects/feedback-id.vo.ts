import { ValueObject } from '../../../../shared/domain/value-object';

export class FeedbackId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): FeedbackId {
    return new FeedbackId(crypto.randomUUID());
  }

  static fromString(id: string): FeedbackId {
    if (!id || id.length === 0) {
      throw new Error('FeedbackId cannot be empty');
    }
    return new FeedbackId(id);
  }

  get value(): string {
    return this.props.value;
  }
}