export type SlotPage<T> = {
  items: T[];
  page: number;
  totalPages: number;
};

/**
 * Pages a list where the first `fixedSlots` of every page are reserved
 * (the "+" tile), so the remaining items keep stable positions per page.
 */
export function pageWithFixedSlots<T>(
  items: readonly T[],
  page: number,
  slotsPerPage: number,
  fixedSlots: number,
): SlotPage<T> {
  const perPage = Math.max(1, slotsPerPage - fixedSlots);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(0, Math.trunc(page)), totalPages - 1);
  return {
    items: items.slice(current * perPage, (current + 1) * perPage),
    page: current,
    totalPages,
  };
}
