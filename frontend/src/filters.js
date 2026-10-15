export const EMPTY_FILTERS = {
  year_from: null,
  year_to: null,
  content_types: [],
  authors: [],
  publications: [],
  topics: [],
};

export const activeFilterCount = (f) =>
  [f.year_from, f.year_to].filter(Boolean).length +
  f.content_types.length + f.authors.length + f.publications.length + f.topics.length;
