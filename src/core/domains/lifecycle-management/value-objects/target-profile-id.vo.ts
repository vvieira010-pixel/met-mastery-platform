import { ValueObject } from '../../../../shared/domain/value-object';

export class TargetProfileId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): TargetProfileId {
    return new TargetProfileId(crypto.randomUUID());
  }

  static fromString(id: string): TargetProfileId {
    if (!id || id.length === 0) {
      throw new Error('TargetProfileId cannot be empty');
    }
    return new TargetProfileId(id);
  }

  get value(): string {
    return this.props.value;
  }
}