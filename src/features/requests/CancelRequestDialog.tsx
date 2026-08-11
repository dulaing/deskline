// this component owns all cancellation behavior:

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRequest } from "../../api/requestApi";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

type CancelRequestDialogProps = {
  open: boolean;
  requestId: string;
  onClose: () => void;
};

export function CancelRequestDialog({
  open,
  requestId,
  onClose,
}: CancelRequestDialogProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => updateRequest(requestId, {
        status: "cancelled",
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [ "request", requestId ],
        }),

        queryClient.invalidateQueries({
          queryKey: ["requests"],
        }),
      ]);

      onClose();
    },
  });

  const errorMessage =
    cancelMutation.isError
      ? cancelMutation.error instanceof Error
        ? cancelMutation.error.message
        : "Could not cancel this request."
      : undefined;

  function handleConfirm(): void {
    if (cancelMutation.isPending) {
      return;
    }

    cancelMutation.mutate();
  }

  function handleClose(): void {
    if (cancelMutation.isPending) {
      return;
    }

    cancelMutation.reset();
    onClose();
  }

  return (
    <ConfirmDialog
      open={open}
      title="Cancel this request?"
      description="This cannot be undone. The activity thread will become read-only."
      confirmLabel={
        cancelMutation.isPending
          ? "Cancelling..."
          : "Cancel request"
      }
      busy={cancelMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}