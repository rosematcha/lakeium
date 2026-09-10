const TRIGGER_CARD = "precious trolley";
const MIN_QUERY_LENGTH = 5;

export function qualifies(query: string, resultNames: readonly string[]): boolean {
  if (query.trim().length < MIN_QUERY_LENGTH) return false;
  return resultNames.some((name) => name.trim().toLowerCase() === TRIGGER_CARD);
}

interface SearchState {
  query: string;
  resultNames: string[];
}

function readSearchState(root: ParentNode): SearchState | null {
  const results = root.querySelector(".search-results");
  const input = results?.parentElement?.querySelector<HTMLInputElement>("form input[type='text']");
  if (!results || !input) return null;
  const resultNames = [...results.querySelectorAll("img[alt]")].map((img) => img.getAttribute("alt") ?? "");
  return { query: input.value, resultNames };
}

/**
 * Returns a checker that reports true once per distinct qualifying query.
 * Leaving the qualifying state re-arms it, so searching again offers help again.
 */
export function createSearchTrigger(root: ParentNode): () => boolean {
  let offeredFor: string | null = null;
  return () => {
    const state = readSearchState(root);
    if (!state || !qualifies(state.query, state.resultNames)) {
      offeredFor = null;
      return false;
    }
    const key = state.query.trim().toLowerCase();
    if (key === offeredFor) return false;
    offeredFor = key;
    return true;
  };
}
