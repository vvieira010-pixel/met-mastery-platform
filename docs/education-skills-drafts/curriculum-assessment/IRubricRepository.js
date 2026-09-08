// Rubric Repository Interface
// Handles rubric generation, storage, and descriptor management

export interface IRubricRepository {
  generate(planId: string, dimensions: string[]): Promise<any>;

  getRubric(planId: string): Promise<any | null>;

  addDescriptor(rubricId: string, dimension: string, descriptor: string): Promise<void>;
}

export class RubricRepository implements IRubricRepository {
  async generate(planId: string, dimensions: string[]): Promise<any> {
    throw new Error('Not implemented yet');
  }

  async getRubric(planId: string): Promise<any> {
    return null;
  }

  async addDescriptor(rubricId: string, dimension: string, descriptor: string): Promise<void> {
    throw new Error('Not implemented yet');
  }
}