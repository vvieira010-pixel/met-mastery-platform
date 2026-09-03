import { getCefrColor as getCefrColorFn } from '../../components/mock-test/constants.js';

export const getCefrColor = getCefrColorFn;

export function getPoints(_type, _level) {
  return 1;
}

export const MOCK_TEST_2 = {
  id: 'mock-test-2',
  title: 'MET Mock Test 2',
  subtitle: 'Full-length practice exam 2 · ~2 h 35 min',
  description: 'Second full-length authentic MET practice exam covering Reading, Listening, Speaking, and Writing.',
  sections: [
    { id: 'reading', label: 'Reading & Grammar', time: '65 min', icon: 'book' },
    { id: 'listening', label: 'Listening', time: '35 min', icon: 'headphones' },
    { id: 'speaking', label: 'Speaking', time: '10 min', icon: 'mic' },
    { id: 'writing', label: 'Writing', time: '45 min', icon: 'edit' },
  ],
};
