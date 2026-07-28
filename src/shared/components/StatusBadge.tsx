import { cva } from "class-variance-authority";

import type { Status } from "../../features/requests/types";

const statusBadgeStyles = cva("status-badge", {
  variants: {
    status: {
      open: "status-badge--open",
      pending: "status-badge--pending",
      closed: "status-badge--closed",
      cancelled: "status-badge--cancelled",
    },
  },
});

type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={statusBadgeStyles({ status })}>
      {status}
    </span>
  );
}