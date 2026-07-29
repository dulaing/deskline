import { Link } from "react-router";

import { StatusBadge } from "../../shared/components/StatusBadge";
import type { Request } from "./types";

type RequestListProps = {
  requests: Request[];
};

export function RequestList({ requests }: RequestListProps) {
  if (requests.length === 0) {
    return <p>No requests found.</p>;
  }

  return (
    <ul className="request-list">
      {requests.map((request) => (
        <li className="request-list-item" key={request.id}>
            
            <Link className="request-title" to={`/requests/${request.id}`}> {request.title} </Link>
            
            <div className="request-metadata"> <StatusBadge status={request.status} />
            
            <span className="request-priority"> {request.priority} </span>

            <span className="request-category"> {request.category} </span>
            
            </div>
        </li>
      ))}
    </ul>
  );
}