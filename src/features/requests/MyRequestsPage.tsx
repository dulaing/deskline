//import { requests } from "../../mocks/data";
import { useQuery } from "@tanstack/react-query";
import {getRequests} from "../../api/requestApi";
import { getSession } from "../auth/session";
import { RequestList } from "./RequestList";
import { RequestFilters } from "./RequestFilters";
import type { Category, Priority, Status } from "./types";

import { Link, useSearchParams } from "react-router";

type FilterKey = "search" | "status" | "priority" | "category";

export function MyRequestsPage() {

   const currentUser = getSession()?.user ?? null;

  // useState (no searchParams)
  // const [titleSearch, setTitleSearch] = useState("");
  // const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  // const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  // const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  // searchParams
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: requests = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
   } = useQuery({ queryKey: ["requests"], queryFn: getRequests});


  const titleSearch = searchParams.get("search") ?? "";
  const statusFilter = (searchParams.get("status") as Status | null) ?? "all";
  const priorityFilter = (searchParams.get("priority") as Priority | null) ?? "all";
  const categoryFilter = (searchParams.get("category") as Category | null) ?? "all";

  if (isPending) {
  return (
    <section className="page-section">
      <div className="state-panel" role="status" aria-live="polite">
        <h1>My requests</h1>
        <p>Loading your requests…</p>
      </div>
    </section>
  );
}

if (isError) {
  return (
    <section className="page-section">
      <div className="state-panel state-panel--error" role="alert">
        <h1>Could not load your requests</h1>

        <p> {error instanceof Error ? error.message : "An unexpected error occurred."} </p>

        <button type="button" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    </section>
  );
}

  const hasActiveFilters =
    titleSearch !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all";

  // if a user is logged in, filter the requests to only include the requests that the user has created
  const myRequests = currentUser ? requests.filter((request) => request.requesterId === currentUser.id) : [];

  const filteredRequests = myRequests.filter((request) => {

    const matchesTitle = request.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;

    return (matchesTitle && matchesStatus && matchesPriority && matchesCategory);
  });

  // the function that updates the URL
  function updateFilter(key:FilterKey, value:string): void {

    const nextSearchParams = new URLSearchParams(searchParams);

    if (value === "" || value === "all") {
      nextSearchParams.delete(key);
    } else {
      nextSearchParams.set(key, value);
    }

    setSearchParams(nextSearchParams, {replace: true});
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Requester</p>
          <h1>My requests</h1>
          <p>Track requests you have sent to the support team.</p>
        </div>
        <Link className="button-link button-link--primary" to="/requests/new">
          New request
        </Link>
      </div>

      <RequestFilters
        titleSearch={titleSearch}
        status={statusFilter}
        priority={priorityFilter}
        category={categoryFilter}
        
        onTitleSearchChange={(value) =>updateFilter("search", value)}
        onStatusChange={(value) => updateFilter("status", value)}
        onPriorityChange={(value) => updateFilter("priority", value)}
        onCategoryChange={(value) => updateFilter("category", value)}
      />


      {myRequests.length === 0 ? (
        /* this is basically a nested if else logic */
        <div className="state-panel">
          <h2>You have no requests yet</h2>
          <p>Create your first request to contact the support team.</p>
          <Link className="button-link button-link--primary" to="/requests/new">
            Create a request
          </Link>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="state-panel">
          <h2>No requests match these filters</h2>
          <p>Clear the filters to see all of your requests.</p>
          {hasActiveFilters && (
            <button type="button" onClick={() => setSearchParams(new URLSearchParams(), {replace: true})}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <RequestList requests={filteredRequests}/>
      )}
    </section>
  );
}
