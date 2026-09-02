/**
 * Utility functions and data structures for TestFileSearch
 */

export const DEFAULT_TEST_FILES = [
  {
    id: '1',
    filename: 'auth-workflow.test.ts',
    tag: 'auth',
    path: 'tests/auth-workflow.test.ts',
    status: 'passed',
    testsCount: 4,
    duration: '24ms',
    description: 'Authentication tokens, session validation and RBAC guards',
  },
  {
    id: '2',
    filename: 'met-b2-multiple-choice.test.js',
    tag: 'exercises',
    path: 'tests/met-b2-multiple-choice.test.js',
    status: 'passed',
    testsCount: 12,
    duration: '35ms',
    description: 'MET B2 exercise families and multiple choice scoring',
  },
  {
    id: '3',
    filename: 'payments.test.js',
    tag: 'finance',
    path: 'tests/payments.test.js',
    status: 'passed',
    testsCount: 8,
    duration: '18ms',
    description: 'Student tuition records, date sorting, and payment validations',
  },
  {
    id: '4',
    filename: 'shell-icon-contract.test.js',
    tag: 'ui',
    path: 'tests/shell-icon-contract.test.js',
    status: 'passed',
    testsCount: 5,
    duration: '12ms',
    description: 'Shared navigation shell and icon registry contracts',
  },
  {
    id: '5',
    filename: 'smoke.test.js',
    tag: 'core',
    path: 'tests/smoke.test.js',
    status: 'passed',
    testsCount: 15,
    duration: '42ms',
    description: 'Base environment smoke test and package script sanity',
  },
  {
    id: '6',
    filename: 'student-dashboard-component.test.js',
    tag: 'dashboard',
    path: 'tests/student-dashboard-component.test.js',
    status: 'passed',
    testsCount: 6,
    duration: '28ms',
    description: 'Student overview dashboard tabs and task action handling',
  },
  {
    id: '7',
    filename: 'student-dashboard-testid-contract.test.js',
    tag: 'contract',
    path: 'tests/student-dashboard-testid-contract.test.js',
    status: 'passed',
    testsCount: 4,
    duration: '16ms',
    description: 'DOM contract and testId compliance verification',
  },
  {
    id: '8',
    filename: 'student-resources-component.test.js',
    tag: 'resources',
    path: 'tests/student-resources-component.test.js',
    status: 'passed',
    testsCount: 7,
    duration: '22ms',
    description: 'Curated PDF study sheets and Michigan reference links',
  },
  {
    id: '9',
    filename: 'student-teacher-boundary.test.js',
    tag: 'security',
    path: 'tests/student-teacher-boundary.test.js',
    status: 'passed',
    testsCount: 9,
    duration: '31ms',
    description: 'Fail-closed API boundary preventing cross-tenant leakage',
  },
  {
    id: '10',
    filename: 'supplementary-listening-pack.test.js',
    tag: 'audio',
    path: 'tests/supplementary-listening-pack.test.js',
    status: 'passed',
    testsCount: 25,
    duration: '64ms',
    description: 'Audio playback and 25 MET listening exercises 76–100',
  },
];

/**
 * Filter and sort test files by query string, active tag, and status.
 *
 * @param {Array} files
 * @param {string} query
 * @param {Object} options
 * @returns {Array}
 */
export function filterTestFiles(files = [], query = '', options = {}) {
  if (!Array.isArray(files)) return [];

  const {
    selectedTag = 'all',
    selectedStatus = 'all',
    sortBy = 'default',
  } = options;

  const trimmedQuery = (query || '').trim().toLowerCase();

  let filtered = files.filter((file) => {
    if (!file) return false;

    // Filter by tag if a specific tag is chosen
    if (selectedTag && selectedTag !== 'all') {
      const fileTag = file.tag ? String(file.tag).toLowerCase() : '';
      if (fileTag !== selectedTag.toLowerCase()) {
        return false;
      }
    }

    // Filter by status if specified
    if (selectedStatus && selectedStatus !== 'all') {
      const fileStatus = file.status ? String(file.status).toLowerCase() : '';
      if (fileStatus !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    // Match query against filename, tag, path, or description
    if (!trimmedQuery) return true;

    const filename = file.filename ? String(file.filename).toLowerCase() : '';
    const tag = file.tag ? String(file.tag).toLowerCase() : '';
    const filePath = file.path ? String(file.path).toLowerCase() : '';
    const description = file.description ? String(file.description).toLowerCase() : '';

    return (
      filename.includes(trimmedQuery) ||
      tag.includes(trimmedQuery) ||
      filePath.includes(trimmedQuery) ||
      description.includes(trimmedQuery)
    );
  });

  // Sort results
  if (sortBy === 'name-asc') {
    filtered = [...filtered].sort((a, b) =>
      (a.filename || '').localeCompare(b.filename || '')
    );
  } else if (sortBy === 'name-desc') {
    filtered = [...filtered].sort((a, b) =>
      (b.filename || '').localeCompare(a.filename || '')
    );
  } else if (sortBy === 'tag') {
    filtered = [...filtered].sort((a, b) =>
      (a.tag || '').localeCompare(b.tag || '')
    );
  }

  return filtered;
}

/**
 * Splits text into segments marking matched characters for query highlighting.
 *
 * @param {string} text
 * @param {string} query
 * @returns {Array<{ text: string, isMatch: boolean }>}
 */
export function highlightSegments(text = '', query = '') {
  if (!text) return [];
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return [{ text, isMatch: false }];

  const regex = new RegExp(`(${cleanQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter(Boolean)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === cleanQuery.toLowerCase(),
    }));
}

/**
 * Returns accessible tag theme badge styles.
 *
 * @param {string} tag
 * @returns {{ badgeBg: string, badgeText: string, border: string }}
 */
export function getTagTheme(tag = '') {
  const normalized = (tag || '').toLowerCase();
  switch (normalized) {
    case 'core':
      return {
        badgeBg: 'bg-blue-50 text-blue-700',
        badgeText: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'auth':
      return {
        badgeBg: 'bg-indigo-50 text-indigo-700',
        badgeText: 'text-indigo-700',
        border: 'border-indigo-200',
      };
    case 'security':
      return {
        badgeBg: 'bg-rose-50 text-rose-700',
        badgeText: 'text-rose-700',
        border: 'border-rose-200',
      };
    case 'finance':
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700',
        badgeText: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'ui':
      return {
        badgeBg: 'bg-purple-50 text-purple-700',
        badgeText: 'text-purple-700',
        border: 'border-purple-200',
      };
    case 'dashboard':
      return {
        badgeBg: 'bg-teal-50 text-teal-700',
        badgeText: 'text-teal-700',
        border: 'border-teal-200',
      };
    case 'resources':
      return {
        badgeBg: 'bg-amber-50 text-amber-700',
        badgeText: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'audio':
      return {
        badgeBg: 'bg-cyan-50 text-cyan-700',
        badgeText: 'text-cyan-700',
        border: 'border-cyan-200',
      };
    case 'exercises':
      return {
        badgeBg: 'bg-orange-50 text-orange-700',
        badgeText: 'text-orange-700',
        border: 'border-orange-200',
      };
    default:
      return {
        badgeBg: 'bg-slate-100 text-slate-700',
        badgeText: 'text-slate-700',
        border: 'border-slate-200',
      };
  }
}
