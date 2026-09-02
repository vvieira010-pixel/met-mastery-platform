import { ValueObject } from '../../../../shared/domain/value-object';

export class NotificationId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): NotificationId {
    return new NotificationId(crypto.randomUUID());
  }

  static fromString(id: string): NotificationId {
    if (!id || id.length === 0) {
      throw new Error('NotificationId cannot be empty');
    }
    return new NotificationId(id);
  }

  get value(): string {
    return this.props.value;
  }
}