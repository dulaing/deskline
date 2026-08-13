import type { Category, Priority, Request, Status } from "./types";

export type StatusFilter = Status | "all";
export type PriorityFilter = Priority | "all";
export type CategoryFilter = Category | "all";

export type BaseRequestFilters = {
  titleSearch: string;
  status: StatusFilter;
  priority: PriorityFilter;
  category: CategoryFilter;
};

export type BaseFilterKey =
  | "search"
  | "status"
  | "priority"
  | "category";

export function filterRequestsByBaseFilters(
  requests: Request[],
  filters: BaseRequestFilters,
): Request[] {
  const normalizedSearch =
    filters.titleSearch.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesTitle =
      normalizedSearch === "" ||
      request.title.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      filters.status === "all" ||
      request.status === filters.status;

    const matchesPriority =
      filters.priority === "all" ||
      request.priority === filters.priority;

    const matchesCategory =
      filters.category === "all" ||
      request.category === filters.category;

    return (
      matchesTitle &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });
}

export function hasActiveBaseFilters(
  filters: BaseRequestFilters,
): boolean {
  return (
    filters.titleSearch.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all"
  );
}
