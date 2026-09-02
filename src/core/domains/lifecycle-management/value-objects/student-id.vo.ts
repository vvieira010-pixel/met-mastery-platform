import { ValueObject } from '../../../../shared/domain/value-object';

export class StudentId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): StudentId {
    return new StudentId(crypto.randomUUID());
  }

  static fromString(id: string): StudentId {
    if (!id || id.length === 0) {
      throw new Error('StudentId cannot be empty');
    }
    return new StudentId(id);
  }

  get value(): string {
    return this.props.value;
  }
}