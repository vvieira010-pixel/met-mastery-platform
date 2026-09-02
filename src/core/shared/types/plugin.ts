export interface DependencyContainer {
  register<T>(token: symbol, implementation: new (...args: any[]) => T): void;
  registerFactory<T>(token: symbol, factory: () => T): void;
  registerInstance<T>(token: symbol, instance: T): void;
  resolve<T>(token: symbol): T;
  isRegistered(token: symbol): boolean;
  clear(): void;
  getAllTokens(): symbol[];
}

export interface DomainPlugin {
  name: string;
  version: string;
  dependencies: string[];
  initialize(kernel: any): Promise<void>;
  shutdown(): Promise<void>;
}

export interface PluginModuleConfig {
  name: string;
  version: string;
  dependencies: string[];
  services: { provide: symbol; useClass: any }[];
  exports: symbol[];
}