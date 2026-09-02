import { Entity } from './entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _version: number = 0;

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version++;
  }

  public applyEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
    this.incrementVersion();
  }
}

// Placeholder for DomainEvent - will be implemented in the events directory
interface DomainEvent {
  readonly timestamp: Date;
}