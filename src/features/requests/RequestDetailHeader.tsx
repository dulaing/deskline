// This component only renders the heading and request facts.

import { Link } from "react-router";
import { StatusBadge } from "../../shared/components/StatusBadge";
import type { Request, User } from "./types";

type RequestDetailHeaderProps = {
  request: Request;
  users: User[];
  backPath: string;
  canCancel: boolean;
  onCancel: () => void;
};

export function RequestDetailHeader({
  request,
  users,
  backPath,
  canCancel,
  onCancel,
}: RequestDetailHeaderProps) {
  const requester = users.find (
    (user) => user.id === request.requesterId,
  );

  const assignee = users.find (
    (user) => user.id === request.assigneeId,
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow"> Request detail </p>
          <h1>{request.title}</h1>
        </div>

        <Link to={backPath}>
          Back to requests
        </Link>
      </div>

      <div className="request-detail-header">
        <dl className="request-facts">
          <div>
            <dt>Status</dt>
            <dd>
              <span className="status-feedback" key={request.status}>
                <StatusBadge status={request.status}/>
              </span>
            </dd>
          </div>

          <div>
            <dt>Priority</dt>
            <dd className="capitalized">
              {request.priority}
            </dd>
          </div>

          <div>
            <dt>Category</dt>
            <dd className="capitalized">
              {request.category}
            </dd>
          </div>

          <div>
            <dt>Requester</dt>
            <dd>
              {requester?.name ??  "Unknown requester"}
            </dd>
          </div>

          <div>
            <dt>Assignee</dt>
            <dd>
              {assignee?.name ?? "Unassigned"}
            </dd>
          </div>
        </dl>

        {canCancel && (
          <button
            type="button"
            className="button button--danger"
            onClick={onCancel}
          >
            Cancel request
          </button>
        )}
      </div>
    </>
  );
}