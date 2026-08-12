import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRequest } from "../../api/requestApi";
import type { Request, User } from "./types";

type AssignToMeButtonProps = {
  request: Request;
  currentUser: User;
};

export function AssignToMeButton({
  request,
  currentUser,
}: AssignToMeButtonProps) {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: () => updateRequest(request.id, { assigneeId: currentUser.id }),

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

  const isFinished =
    request.status === "closed" ||
    request.status === "cancelled";

  const isAssignedToMe =
    request.assigneeId === currentUser.id;

  const canAssignToMe =
    isStaff &&
    !isFinished &&
    !isAssignedToMe;

  if (!canAssignToMe) {
    return null;
  }

  return (
    <div className="request-actions">
      <button
        type="button"
        className="button--primary"
        disabled={assignMutation.isPending}
        onClick={() => assignMutation.mutate()}
      >
        {assignMutation.isPending
          ? "Assigning..."
          : "Assign to me"}
      </button>

      {assignMutation.isError && (
        <p className="field-error" role="alert">
          {assignMutation.error instanceof Error
            ? assignMutation.error.message
            : "Could not assign request."}
        </p>
      )}
    </div>
  );
}