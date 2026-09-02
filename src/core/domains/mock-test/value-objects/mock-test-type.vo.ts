/**
 * @graphify:node met_test_basics_task_breakdown_met_exam_structure
 * @graphify:edge -> met_test_basics_task_breakdown_met_exam_structure references EXTRACTED
 */
import { ValueObject } from '../../../shared/domain/value-object';

type MockTestTypeValue = 'mock-test-1' | 'mock-test-2' | 'mock-test-3';

export class MockTestType extends ValueObject<MockTestTypeValue> {
  private constructor(type: MockTestTypeValue) {
    super({ value: type });
  }

  static mockTest1(): MockTestType { return new MockTestType('mock-test-1'); }
  static mockTest2(): MockTestType { return new MockTestType('mock-test-2'); }
  static mockTest3(): MockTestType { return new MockTestType('mock-test-3'); }

  get value(): MockTestTypeValue {
    return this.props.value;
  }

  public isMockTest1(): boolean { return this.value === 'mock-test-1'; }
  public isMockTest2(): boolean { return this.value === 'mock-test-2'; }
  public isMockTest3(): boolean { return this.value === 'mock-test-3'; }
}