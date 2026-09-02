import { ValueObject } from '../../../../shared/domain/value-object';

export class ClassEventId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): ClassEventId {
    return new ClassEventId(crypto.randomUUID());
  }

  static fromString(id: string): ClassEventId {
    if (!id || id.length === 0) {
      throw new Error('ClassEventId cannot be empty');
    }
    return new ClassEventId(id);
  }

  get value(): string {
    return this.props.value;
  }
}