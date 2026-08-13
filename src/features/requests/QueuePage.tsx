import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { getRequests } from "../../api/requestApi";
import { RequestList } from "./RequestList";
import { RequestFilters } from "./RequestFilters";
import {
  filterRequestsByBaseFilters,
  hasActiveBaseFilters,
  type BaseFilterKey,
  type CategoryFilter,
  type PriorityFilter,
  type StatusFilter,
} from "./requestFiltering";

export function QueuePage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    data: requests = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
    } = useQuery({
      queryKey: ["requests"],
      queryFn: getRequests,
    });

    const titleSearch = searchParams.get("search") ?? "";
    const statusFilter =
      (searchParams.get("status") as StatusFilter | null) ??
      "all";
    const priorityFilter =
      (searchParams.get("priority") as PriorityFilter | null) ??
      "all";
    const categoryFilter =
      (searchParams.get("category") as CategoryFilter | null) ??
      "all";

    const filters = {
      titleSearch,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
    };

    const hasActiveFilters =
      hasActiveBaseFilters(filters);

    const filteredRequests =
      filterRequestsByBaseFilters(requests, filters);

    function updateFilter(
      key: BaseFilterKey,
      value: string,
    ): void {
      const nextSearchParams =
        new URLSearchParams(searchParams);

      if (value === "" || value === "all") {
        nextSearchParams.delete(key);
      } else {
        nextSearchParams.set(key, value);
      }

      setSearchParams(nextSearchParams, {
        replace: true,
      });
    }

    if (isPending) {
      return (
        <section className="page-section">
          <div
            className="state-panel"
            role="status"
            aria-live="polite"
          >
            <h1>Request queue</h1>
            <p>Loading requests...</p>
          </div>
        </section>
      )
    }

    if (isError) {
      return (
        <section className="page-section">
          <div
            className="state-panel state-panel--error"
            role="alert"
          >
            <h1>Could not load the request queue</h1>
            <p>{error instanceof Error ? error.message : "An unexpected error occurred."}</p>

            <button type="button" disabled={isFetching} onClick={() => void refetch()}>
              {isFetching ? "Retrying..." : "Retry"}
            </button>
          </div>
        </section>
      )
    }

    return (
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Staff</p>
            <h1>Request queue</h1>
            <p>Review and work requests across the team.</p>
          </div>
        </div>

        <RequestFilters
          titleSearch={titleSearch}
          status={statusFilter}
          priority={priorityFilter}
          category={categoryFilter}
          onTitleSearchChange={(value) =>
            updateFilter("search", value)
          }
          onStatusChange={(value) =>
            updateFilter("status", value)
          }
          onPriorityChange={(value) =>
            updateFilter("priority", value)
          }
          onCategoryChange={(value) =>
            updateFilter("category", value)
          }
        />

        {requests.length === 0 ? (
          <div className="state-panel">
            <h2>The queue is empty</h2>
            <p>There are no requests for staff to review.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="state-panel">
            <h2>No requests match these filters</h2>
            <p>Clear the filters to see the full queue.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() =>
                  setSearchParams(
                    new URLSearchParams(),
                    { replace: true },
                  )
                }
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <RequestList requests={filteredRequests} />
        )}
      </section>
    );
  }
