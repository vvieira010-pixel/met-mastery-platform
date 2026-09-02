import { ValueObject } from '../../../shared/domain/value-object';

export class MockTestId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): MockTestId {
    return new MockTestId(crypto.randomUUID());
  }

  static fromString(id: string): MockTestId {
    if (!id || id.length === 0) {
      throw new Error('MockTestId cannot be empty');
    }
    return new MockTestId(id);
  }

  get value(): string {
    return this.props.value;
  }
}