import { requests } from "../../mocks/data";
import { getSession } from "../auth/session";
import { RequestList } from "./RequestList";

export function MyRequestsPage() {
  const currentUser = getSession();

  // if a user is logged in, filter the requests to only include the requests that the user has created
  const myRequests = currentUser ? requests.filter((request) => request.requesterId === currentUser.id) : [];

  return (
    <>
      <h1>My requests</h1>
      <RequestList requests={myRequests} />
    </>
  );
}