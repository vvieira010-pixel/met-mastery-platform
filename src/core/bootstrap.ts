/**
 * @graphify:node core_bootstrap_bootstrapkernel
 * @graphify:node core_bootstrap_shutdownkernel
 * @graphify:edge -> kernel_claude_flow_kernel_claudeflowkernel calls EXTRACTED
 */
import { ClaudeFlowKernel, KernelConfig } from '../kernel/claude-flow-kernel';
import { TaskManagementDomain } from './domains/task-management/task-management.domain';
import { SessionManagementDomain } from './domains/session-management/session-management.domain';
import { HealthMonitoringDomain } from './domains/health-monitoring/health-monitoring.domain';
import { LifecycleManagementDomain } from './domains/lifecycle-management/lifecycle-management.domain';
import { EventCoordinationDomain } from './domains/event-coordination/event-coordination.domain';
import { MockTestDomain } from './domains/mock-test/mock-test.domain';
import { SwarmCoordinationPlugin } from '../plugins/swarm-coordination.plugin';

export async function bootstrapKernel(): Promise<ClaudeFlowKernel> {
  const domains = [
    new TaskManagementDomain(),
    new SessionManagementDomain(),
    new HealthMonitoringDomain(),
    new LifecycleManagementDomain(),
    new EventCoordinationDomain(),
    new MockTestDomain()
  ];

  const plugins = [
    new SwarmCoordinationPlugin()
  ];

  const config: KernelConfig = {
    domains,
    plugins
  };

  const kernel = new ClaudeFlowKernel(config);
  await kernel.initialize();

  return kernel;
}

export async function shutdownKernel(kernel: ClaudeFlowKernel): Promise<void> {
  await kernel.shutdown();
}