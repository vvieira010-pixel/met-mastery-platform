import { ValueObject } from '../../../../shared/domain/value-object';

export class ProgressNoteId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): ProgressNoteId {
    return new ProgressNoteId(crypto.randomUUID());
  }

  static fromString(id: string): ProgressNoteId {
    if (!id || id.length === 0) {
      throw new Error('ProgressNoteId cannot be empty');
    }
    return new ProgressNoteId(id);
  }

  get value(): string {
    return this.props.value;
  }
}