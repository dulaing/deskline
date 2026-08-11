// this component only renders messages
// it receives messages + users + current status

import type { Message, Status, User } from "./types";

type RequestMessageThreadProps = {
  messages: Message[];
  users: User[];
  status: Status;
};

export function RequestMessageThread({
  messages,
  users,
  status,
}: RequestMessageThreadProps) {
  const isReadOnly =
    status === "closed" ||
    status === "cancelled";

  return (
    <section
      className="message-thread"
      aria-labelledby="activity-heading"
    >
      <h2 id="activity-heading">
        Activity
      </h2>

      {messages.length === 0 ? (
        <div className="state-panel state-panel--compact">
          <p>No messages have been added.</p>
        </div>
      ) : (
        <ol className="message-list">
          {messages.map((message) => {
            const author = users.find(
              (user) => user.id === message.authorId,
            );

            return (
              <li
                key={message.id}
                className="message"
              >
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
          This request is {status}. Its activity
          is read-only.
        </p>
      )}
    </section>
  );
}