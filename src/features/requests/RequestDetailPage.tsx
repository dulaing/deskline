import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";

import { messages, requests, users} from "../../mocks/data";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { getSession } from "../auth/session";
import type { Message, Request } from "./types";

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = getSession()?.user ?? null;

  const [request, setRequest] = useState<Request | undefined>(
    () => requests.find((candidate) => candidate.id === id),
  );

  const [requestMessages, setRequestMessages] = useState<Message[]>(
    () => messages.filter((message) => message.requestId === id),
  );

  const [isCancelDialogOpen, setIsCancelDialogOpen] =  useState(false);

  function handleRetry(): void {
    setRequest(
      requests.find((candidate) => candidate.id === id),
    );
    setRequestMessages(
      messages.filter((message) => message.requestId === id),
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!request) {
    return (
      <section
        className="state-panel state-panel--error"
        role="alert"
      >
        <p className="eyebrow">Request error</p>
        <h1>We could not load this request</h1>
        <p>
          It may have been removed, or the link may be incorrect.
        </p>
        <div className="state-actions">
          <button
            type="button"
            onClick={handleRetry}
          >
            Retry
          </button>
          <Link to="/my-requests">Back to requests</Link>
        </div>
      </section>
    );
  }

  const isStaff = currentUser.role === "technician" || currentUser.role === "admin";
  const canView = isStaff || request.requesterId === currentUser.id;

  if (!canView) {
    return <Navigate to="/my-requests" replace />;
  }

  const visibleRequest = request;
  const signedInUser = currentUser;

  const requester = users.find(
    (user) => user.id === request.requesterId,
  );
  const assignee = users.find(
    (user) => user.id === request.assigneeId,
  );
  const canCancel =
    currentUser.role === "requester" &&
    currentUser.id === request.requesterId &&
    request.status === "open";
  const isReadOnly =
    request.status === "closed" ||
    request.status === "cancelled";

  function handleCancel(): void {
    if (!canCancel) {
      return;
    }

    const now = new Date().toISOString();
    const updatedRequest: Request = {
      ...visibleRequest,
      status: "cancelled",
      updatedAt: now,
    };
    const systemMessage: Message = {
      id: `message-${crypto.randomUUID()}`,
      requestId: visibleRequest.id,
      authorId: signedInUser.id,
      body: "Cancelled by requester.",
      createdAt: now,
    };
    const requestIndex = requests.findIndex(
      (candidate) => candidate.id === visibleRequest.id,
    );

    if (requestIndex >= 0) {
      requests[requestIndex] = updatedRequest;
    }

    messages.push(systemMessage);
    setRequest(updatedRequest);
    setRequestMessages((current) => [
      ...current,
      systemMessage,
    ]);
    setIsCancelDialogOpen(false);
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Request detail</p>
          <h1>{request.title}</h1>
        </div>
        <Link to={ currentUser.role === "requester" ? "/my-requests" : "/queue" } >
          Back to requests
        </Link>
      </div>

      <div className="request-detail-header">
        <dl className="request-facts">
          <div>
            <dt>Status</dt>
            <dd>
              <span
                className="status-feedback"
                key={request.status}
              >
                <StatusBadge status={request.status} />
              </span>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd className="capitalized">{request.priority}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd className="capitalized">{request.category}</dd>
          </div>
          <div>
            <dt>Requester</dt>
            <dd>{requester?.name ?? "Unknown requester"}</dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>{assignee?.name ?? "Unassigned"}</dd>
          </div>
        </dl>

        {canCancel && (
          <button
            type="button"
            className="button button--danger"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            Cancel request
          </button>
        )}
      </div>

      <section
        className="message-thread"
        aria-labelledby="activity-heading"
      >
        <h2 id="activity-heading">Activity</h2>

        {requestMessages.length === 0 ? (
          <div className="state-panel state-panel--compact">
            <p>No messages have been added.</p>
          </div>
        ) : (
          <ol className="message-list">
            {requestMessages.map((message) => {
              const author = users.find(
                (user) => user.id === message.authorId,
              );

              return (
                <li key={message.id} className="message">
                  <div className="message-meta">
                    <strong>
                      {author?.name ?? "Deskline system"}
                    </strong>
                    <time dateTime={message.createdAt}>
                      {new Date(message.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p>{message.body}</p>
                </li>
              );
            })}
          </ol>
        )}

        {isReadOnly && (
          <p className="read-only-note">
            This request is {request.status}. Its activity is
            read-only.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancel this request?"
        description="This cannot be undone. The activity thread will become read-only."
        confirmLabel="Cancel request"
        onConfirm={handleCancel}
        onClose={() => setIsCancelDialogOpen(false)}
      />
    </section>
  );
}
