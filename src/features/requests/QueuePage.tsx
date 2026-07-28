import { requests } from "../../mocks/data";
import { RequestList } from "./RequestList";

export function QueuePage() {
  return (
    <>
      <h1>Request queue</h1>
      <RequestList requests={requests} />
    </>
  );
}