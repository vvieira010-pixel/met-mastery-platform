export function useHelp() {
  return {
    openHelp: (topic) => window.dispatchEvent(new CustomEvent('help:open', { detail: topic })),
  };
}