import { ValueObject } from '../../../../shared/domain/value-object';

export class HomeworkId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): HomeworkId {
    return new HomeworkId(crypto.randomUUID());
  }

  static fromString(id: string): HomeworkId {
    if (!id || id.length === 0) {
      throw new Error('HomeworkId cannot be empty');
    }
    return new HomeworkId(id);
  }

  get value(): string {
    return this.props.value;
  }
}