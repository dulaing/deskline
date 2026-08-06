import { useQuery } from "@tanstack/react-query";
import { getRequests } from "../../api/requestApi";
import { RequestList } from "./RequestList";

export function QueuePage() {
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

    if (isPending) {
      return (
        <div className="state-panel" role="status" aria-live="polite">
          <h1> Request queue</h1>
          <p>Loading requests...</p>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="state-panel" role="alert">
          <h1> Could not load the request queue</h1>
          <p>{error instanceof Error ? error.message : "An unexpected error occurred."}</p>

          <button type="button" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      )
    }

    if (requests.length === 0) {
      return (
        <div className="state-panel">
          <h1>Request queue</h1>
          <p>The queue is empty.</p>
        </div>
      )
    }

    return (
      <>
        <h1>Request Queue</h1>
        <RequestList requests={requests} />
      </>
    );
  }