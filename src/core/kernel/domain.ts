/**
 * @graphify:node kernel_domain_domain
 */
import { DependencyContainer } from '../shared/types/plugin';

export interface Domain {
  name: string;
  initialize(container: DependencyContainer): Promise<void>;
  shutdown(): Promise<void>;
  eventHandlers?: Record<string, Function[]>;
}

export interface DomainModuleConfig {
  name: string;
  entities: any[];
  valueObjects: any[];
  services: any[];
  repositories: { provide: symbol; useClass: any }[];
  eventHandlers: any[];
}

export abstract class BaseDomain implements Domain {
  abstract name: string;
  eventHandlers?: Record<string, Function[]> = {};

  async initialize(container: DependencyContainer): Promise<void> {
    console.log(`[Domain] Initializing: ${this.name}`);
    await this.registerDependencies(container);
    console.log(`[Domain] Initialized: ${this.name}`);
  }

  abstract async registerDependencies(container: DependencyContainer): Promise<void>;

  async shutdown(): Promise<void> {
    console.log(`[Domain] Shutting down: ${this.name}`);
  }

  protected registerEventHandler(eventType: string, handler: Function): void {
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }
}