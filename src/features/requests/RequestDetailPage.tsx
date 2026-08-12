import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Link, Navigate, useParams } from "react-router";

import { getRequest } from "../../api/requestApi";
import { getSession } from "../auth/session";

import { CancelRequestDialog } from "./CancelRequestDialog";
import { RequestDetailHeader } from "./RequestDetailHeader";
import { RequestMessageThread } from "./RequestMessageThread";

import { AddCommentForm } from "./AddCommentForm";
import { AssignToMeButton } from "./AssignToMeButton";


export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = id ?? "";

  const currentUser = getSession()?.user ?? null;

  const [
    isCancelDialogOpen,
    setIsCancelDialogOpen,
  ] = useState(false);

  const requestQuery = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getRequest(requestId),
    enabled: requestId !== "",
  });

  

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const backPath =
    currentUser.role === "requester"
      ? "/my-requests"
      : "/queue";

  if (!requestId) {
    return <Navigate to={backPath} replace />;
  }

  if (requestQuery.isPending) {
    return (
      <section
        className="state-panel"
        role="status"
        aria-live="polite"
      >
        <p className="eyebrow">
          Request detail
        </p>

        <h1>Loading request...</h1>
      </section>
    );
  }

  if (requestQuery.isError) {
    return (
      <section
        className="state-panel state-panel--error"
        role="alert"
      >
        <p className="eyebrow">
          Request error
        </p>

        <h1>
          We could not load this request
        </h1>

        <p>
          {requestQuery.error instanceof Error
            ? requestQuery.error.message
            : "An unexpected error occurred."}
        </p>

        <div className="state-actions">
          <button
            type="button"
            disabled={requestQuery.isFetching}
            onClick={() => void requestQuery.refetch()}
          >
            {requestQuery.isFetching
              ? "Retrying..."
              : "Retry"}
          </button>

          <Link to={backPath}>
            Back to requests
          </Link>
        </div>
      </section>
    );
  }

  const {
    request,
    messages,
    users,
  } = requestQuery.data;

  const canComment =
    request.status === "open" ||
    request.status === "pending";

  const canCancel =
    currentUser.role === "requester" &&
    currentUser.id === request.requesterId &&
    request.status === "open";

  return (
    <section className="page-section">
      <RequestDetailHeader
        request={request}
        users={users}
        backPath={backPath}
        canCancel={canCancel}
        onCancel={() => setIsCancelDialogOpen(true)}
      />

      <AssignToMeButton
        request={request}
        currentUser={currentUser}
      />

      <RequestMessageThread
        messages={messages}
        users={users}
        status={request.status}
      />

      {canComment && ( <AddCommentForm requestId={request.id}/> )}

      <CancelRequestDialog
        open={isCancelDialogOpen}
        requestId={request.id}
        onClose={() => setIsCancelDialogOpen(false)}
      />
    </section>
  );
}