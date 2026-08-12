import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateRequest } from "../../api/requestApi";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

type CloseRequestDialogProps = {
  open: boolean;
  requestId: string;
  onClose: () => void;
};

export function CloseRequestDialog({
  open,
  requestId,
  onClose,
}: CloseRequestDialogProps) {
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: () => updateRequest(requestId, {status: "closed"}),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["request", requestId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["requests"],
        }),
      ]);

      onClose();
    },
  });

  const errorMessage =
    closeMutation.isError
      ? closeMutation.error instanceof Error
        ? closeMutation.error.message
        : "Could not close this request."
      : undefined;

  function handleConfirm(): void {
    if (closeMutation.isPending) {
      return;
    }

    closeMutation.mutate();
  }

  function handleClose(): void {
    if (closeMutation.isPending) {
      return;
    }

    closeMutation.reset();
    onClose();
  }

  return (
    <ConfirmDialog
      open={open}
      title="Close this request?"
      description="This will mark the request as complete. The activity thread will become read-only."
      confirmLabel={
        closeMutation.isPending
          ? "Closing..."
          : "Close request"
      }
      busy={closeMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}