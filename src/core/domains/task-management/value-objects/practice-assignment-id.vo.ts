import { ValueObject } from '../../../../shared/domain/value-object';

export class PracticeAssignmentId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): PracticeAssignmentId {
    return new PracticeAssignmentId(crypto.randomUUID());
  }

  static fromString(id: string): PracticeAssignmentId {
    if (!id || id.length === 0) {
      throw new Error('PracticeAssignmentId cannot be empty');
    }
    return new PracticeAssignmentId(id);
  }

  get value(): string {
    return this.props.value;
  }
}