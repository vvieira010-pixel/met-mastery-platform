import { ValueObject } from '../../../../shared/domain/value-object';

export class SessionId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): SessionId {
    return new SessionId(crypto.randomUUID());
  }

  static fromString(id: string): SessionId {
    if (!id || id.length === 0) {
      throw new Error('SessionId cannot be empty');
    }
    return new SessionId(id);
  }

  get value(): string {
    return this.props.value;
  }
}