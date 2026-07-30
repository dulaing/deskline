import { requests } from "../../mocks/data";
import { getSession } from "../auth/session";
import { RequestList } from "./RequestList";
import { RequestFilters } from "./RequestFilters";
import type { Category, Priority, Status } from "./types";

import {useState} from "react";
import { useSearchParams } from "react-router";

type FilterKey = "search" | "status" | "priority" | "category";

export function MyRequestsPage() {

   const currentUser = getSession();

  // useState (no searchParams)
  // const [titleSearch, setTitleSearch] = useState("");
  // const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  // const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  // const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  // searchParams
  const [searchParams, setSearchParams] = useSearchParams();
  const titleSearch = searchParams.get("search") ?? "";
  const statusFilter = (searchParams.get("status") as Status | null) ?? "all";
  const priorityFilter = (searchParams.get("priority") as Priority | null) ?? "all";
  const categoryFilter = (searchParams.get("category") as Category | null) ?? "all";

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
    <>
      <h1>My requests</h1>
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
      <RequestList requests={filteredRequests} />
    </>
  );
}