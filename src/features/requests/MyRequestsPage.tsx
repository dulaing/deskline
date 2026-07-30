import { requests } from "../../mocks/data";
import { getSession } from "../auth/session";
import { RequestList } from "./RequestList";
import { RequestFilters } from "./RequestFilters";

import {useState} from "react";
import type { Category, Priority, Status } from "./types";

export function MyRequestsPage() {
  const currentUser = getSession();

  const [titleSearch, setTitleSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  // if a user is logged in, filter the requests to only include the requests that the user has created
  const myRequests = currentUser ? requests.filter((request) => request.requesterId === currentUser.id) : [];

  const filteredRequests = myRequests.filter((request) => {

    const matchesTitle = request.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;

    return (
      matchesTitle &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  return (
    <>
      <h1>My requests</h1>
      <RequestFilters
        titleSearch={titleSearch}
        status={statusFilter}
        priority={priorityFilter}
        category={categoryFilter}
        onTitleSearchChange={setTitleSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onCategoryChange={setCategoryFilter}
      />
      <RequestList requests={filteredRequests} />
    </>
  );
}