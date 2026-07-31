import type { Category, Priority, Status } from "./types";

type RequestFiltersProps = {
  titleSearch: string;
  status: Status | "all";
  priority: Priority | "all";
  category: Category | "all";
  onTitleSearchChange: (value: string) => void;
  onStatusChange: (value: Status | "all") => void;
  onPriorityChange: (value: Priority | "all") => void;
  onCategoryChange: (value: Category | "all") => void;
};

export function RequestFilters({
  titleSearch,
  status,
  priority,
  category,
  onTitleSearchChange,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
}: RequestFiltersProps) {
  return (
    <fieldset className="request-filters">
      <legend className="visually-hidden">Filter requests</legend>

      <label htmlFor="request-search">
        <span>Search by title</span>
        <input
          id="request-search"
          type="search"
          value={titleSearch}
          placeholder="Search requests"
          onChange={(event) =>
            onTitleSearchChange(event.target.value)
          }
        />
      </label>

      <label htmlFor="request-status">
        <span>Status</span>
        <select
          id="request-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as Status | "all")
          }
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label htmlFor="request-priority-filter">
        <span>Priority</span>
        <select
          id="request-priority-filter"
          value={priority}
          onChange={(event) =>
            onPriorityChange(event.target.value as Priority | "all")
          }
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label htmlFor="request-category-filter">
        <span>Category</span>
        <select
          id="request-category-filter"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as Category | "all")
          }
        >
          <option value="all">All categories</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="facilities">Facilities</option>
          <option value="access">Access</option>
        </select>
      </label>
    </fieldset>
  );
}
