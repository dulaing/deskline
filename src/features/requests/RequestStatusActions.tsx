import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRequest } from "../../api/requestApi";
import type { Request, Status, User } from "./types";

type RequestStatusActionsProps = {
  request: Request;
  currentUser: User;
};

export function RequestStatusActions({
  request,
  currentUser,
}: RequestStatusActionsProps) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (nextStatus: Status) => updateRequest(request.id, { status: nextStatus}),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["request", request.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["requests"],
        }),
      ]);
    },
  });

  const isStaff =
    currentUser.role === "technician" ||
    currentUser.role === "admin";

  const canSetPending =
    isStaff && request.status === "open";

  const canReopen =
    isStaff && request.status === "pending";

  if (!canSetPending && !canReopen) {
    return null;
  }

  return (
    <div className="request-actions">
      {canSetPending && (
        <button
          type="button"
          className="button--primary"
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate("pending")}
        >
          {statusMutation.isPending
            ? "Updating..."
            : "Set pending"}
        </button>
      )}

      {canReopen && (
        <button
          type="button"
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate("open")}
        >
          {statusMutation.isPending
            ? "Updating..."
            : "Reopen"}
        </button>
      )}

      {statusMutation.isError && (
        <p className="field-error" role="alert">
          {statusMutation.error instanceof Error
            ? statusMutation.error.message
            : "Could not update status."}
        </p>
      )}
    </div>
  );
}