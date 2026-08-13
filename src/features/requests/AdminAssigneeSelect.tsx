import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent } from "react";

import { updateRequest } from "../../api/requestApi";
import { getUsers } from "../../api/userApi";
import type { Request, User } from "./types";

type AdminAssigneeSelectProps = {
  request: Request;
  currentUser: User;
};

export function AdminAssigneeSelect({
  request,
  currentUser,
}: AdminAssigneeSelectProps) {
  const queryClient = useQueryClient();

  const isAdmin = currentUser.role === "admin";

  const isFinished =
    request.status === "closed" ||
    request.status === "cancelled";

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAdmin && !isFinished,
  });

  const assigneeMutation = useMutation({
    mutationFn: (nextAssigneeId: string | null) => updateRequest(request.id, { assigneeId: nextAssigneeId }),

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

  if (!isAdmin || isFinished) {
    return null;
  }

  const staffUsers =
    usersQuery.data?.filter(
      (user) =>
        user.role === "technician" ||
        user.role === "admin",
    ) ?? [];

  function handleAssigneeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    const nextAssigneeId =
      event.target.value === ""
        ? null
        : event.target.value;

    assigneeMutation.mutate(nextAssigneeId);
  }

  return (
    <div className="request-actions">
      <label className="assignee-control">
        <span>Assignee</span>

        <select
          value={request.assigneeId ?? ""}
          disabled={
            usersQuery.isPending ||
            usersQuery.isError ||
            assigneeMutation.isPending
          }
          onChange={handleAssigneeChange}
        >
          <option value="">Unassigned</option>

          {staffUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </label>

      {usersQuery.isPending && (
        <p className="field-hint">Loading staff...</p>
      )}

      {assigneeMutation.isPending && (
        <p className="field-hint">Saving assignee...</p>
      )}

      {usersQuery.isError && (
        <p className="field-error" role="alert">
          Could not load users.
        </p>
      )}

      {assigneeMutation.isError && (
        <p className="field-error" role="alert">
          {assigneeMutation.error instanceof Error
            ? assigneeMutation.error.message
            : "Could not update assignee."}
        </p>
      )}
    </div>
  );
}