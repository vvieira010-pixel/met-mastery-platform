import { Domain } from './domain';
import { DomainPlugin } from '../types/plugin';
import { container } from '../shared/infrastructure/dependency-container';

export interface KernelConfig {
  domains: Domain[];
  plugins: DomainPlugin[];
}

export class ClaudeFlowKernel {
  private domains: Map<string, Domain> = new Map();
  private plugins: Map<string, DomainPlugin> = new Map();
  private domainEventHandlers: Map<string, Function[]> = new Map();
  private initialized = false;

  constructor(private config: KernelConfig) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Kernel already initialized');
      return;
    }

    console.log('[Kernel] Initializing ClaudeFlow Kernel...');

    for (const domain of this.config.domains) {
      await this.loadDomain(domain);
    }

    for (const plugin of this.config.plugins) {
      await this.loadPlugin(plugin);
    }

    this.setupDomainEventHandlers();
    this.initialized = true;

    console.log('[Kernel] Initialization complete');
  }

  async loadDomain(domain: Domain): Promise<void> {
    const name = domain.name;
    console.log(`[Kernel] Loading domain: ${name}`);

    await domain.initialize(container);
    this.domains.set(name, domain);

    console.log(`[Kernel] Domain loaded: ${name}`);
  }

  async loadPlugin(plugin: DomainPlugin): Promise<void> {
    const name = plugin.name;
    console.log(`[Kernel] Loading plugin: ${name} v${plugin.version}`);

    for (const dep of plugin.dependencies) {
      if (!this.domains.has(dep)) {
        throw new Error(`Plugin ${name} requires domain ${dep} which is not loaded`);
      }
    }

    await plugin.initialize(this);
    this.plugins.set(name, plugin);

    console.log(`[Kernel] Plugin loaded: ${name}`);
  }

  getDomain<T extends Domain>(name: string): T {
    const domain = this.domains.get(name);
    if (!domain) {
      throw new Error(`Domain not found: ${name}`);
    }
    return domain as T;
  }

  getPlugin<T extends DomainPlugin>(name: string): T {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }
    return plugin as T;
  }

  hasDomain(name: string): boolean {
    return this.domains.has(name);
  }

  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  publishDomainEvent(event: DomainEvent): void {
    const handlers = this.domainEventHandlers.get(event.eventType) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`[Kernel] Error handling event ${event.eventType}:`, error);
      }
    }
  }

  subscribeToDomainEvent(eventType: string, handler: Function): void {
    const handlers = this.domainEventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.domainEventHandlers.set(eventType, handlers);
  }

  async shutdown(): Promise<void> {
    console.log('[Kernel] Shutting down...');

    for (const [name, plugin] of this.plugins) {
      try {
        await plugin.shutdown();
        console.log(`[Kernel] Plugin shutdown: ${name}`);
      } catch (error) {
        console.error(`[Kernel] Error shutting down plugin ${name}:`, error);
      }
    }

    for (const [name, domain] of this.domains) {
      try {
        await domain.shutdown();
        console.log(`[Kernel] Domain shutdown: ${name}`);
      } catch (error) {
        console.error(`[Kernel] Error shutting down domain ${name}:`, error);
      }
    }

    this.domains.clear();
    this.plugins.clear();
    this.domainEventHandlers.clear();
    this.initialized = false;

    console.log('[Kernel] Shutdown complete');
  }

  private setupDomainEventHandlers(): void {
    for (const domain of this.domains.values()) {
      if (domain.eventHandlers) {
        for (const [eventType, handlers] of Object.entries(domain.eventHandlers)) {
          for (const handler of handlers) {
            this.subscribeToDomainEvent(eventType, handler.bind(domain));
          }
        }
      }
    }
  }

  getLoadedDomains(): string[] {
    return Array.from(this.domains.keys());
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}

export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  payload: any;
  timestamp: Date;
  version: number;
}

export function createDomainEvent(
  eventType: string,
  aggregateId: string,
  payload: any
): DomainEvent {
  return {
    eventType,
    aggregateId,
    payload,
    timestamp: new Date(),
    version: 1
  };
}