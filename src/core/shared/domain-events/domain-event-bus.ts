/**
 * @graphify:node domain_events_domain_event_bus_inmemorydomaineventbus
 */
import { DomainEvent, DomainEventBus, EventHandler } from '../types/plugin';

export class InMemoryDomainEventBus implements DomainEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventLog: DomainEvent[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 10000) {
    this.maxLogSize = maxLogSize;
  }

  async publish(event: DomainEvent): Promise<void> {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    const handlers = this.handlers.get(event.eventType) || [];
    const allHandlers = this.handlers.get('*') || [];
    
    await Promise.all([
      ...handlers.map(h => h(event)),
      ...allHandlers.map(h => h(event))
    ]);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    const index = existing.indexOf(handler);
    if (index > -1) {
      existing.splice(index, 1);
      this.handlers.set(eventType, existing);
    }
  }

  getEventLog(): DomainEvent[] {
    return [...this.eventLog];
  }

  getEventLogByType(eventType: string): DomainEvent[] {
    return this.eventLog.filter(e => e.eventType === eventType);
  }

  getEventLogByAggregate(aggregateId: string): DomainEvent[] {
    return this.eventLog.filter(e => e.aggregateId === aggregateId);
  }

  clearLog(): void {
    this.eventLog = [];
  }
}

export function createDomainEvent(
  eventType: string,
  aggregateId: string,
  payload: Record<string, any>,
  version = 1
): DomainEvent {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    aggregateId,
    occurredOn: new Date(),
    payload,
    version
  };
}