import { ValueObject } from '../../../../shared/domain/value-object';

export class MessageId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): MessageId {
    return new MessageId(crypto.randomUUID());
  }

  static fromString(id: string): MessageId {
    if (!id || id.length === 0) {
      throw new Error('MessageId cannot be empty');
    }
    return new MessageId(id);
  }

  get value(): string {
    return this.props.value;
  }
}