import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { addMessage } from "../../api/requestApi";

type AddCommentFormProps = {
  requestId: string;
};

export function AddCommentForm({requestId}: AddCommentFormProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const commentMutation = useMutation({
    mutationFn: (commentBody: string) => addMessage(requestId, commentBody),

    onSuccess: async () => {
        
        setBody("");
        
        await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [ "request", requestId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["requests"],
        }),
      ]);
    },
  });

  const isEmpty = body.trim().length === 0;

  function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    if (isEmpty || commentMutation.isPending) {
      return;
    }

    commentMutation.mutate(body.trim());
  }

  function handleBodyChange(
    value: string,
  ): void {
    setBody(value);

    if (commentMutation.isError) {
      commentMutation.reset();
    }
  }

  return (
    <form
      className="request-form"
      onSubmit={handleSubmit}
    >
      <div className="form-field">
        <label htmlFor="new-comment">
          Add a comment
        </label>

        <textarea
          id="new-comment"
          name="comment"
          rows={4}
          value={body}
          disabled={commentMutation.isPending}
          placeholder="Write an update..."
          onChange={(event) => handleBodyChange(event.target.value)}
        />
      </div>

      {commentMutation.isError && (
        <p
          className="field-error"
          role="alert"
        >
          {commentMutation.error instanceof Error
            ? commentMutation.error.message
            : "Could not add the comment."}
        </p>
      )}

      <div className="form-actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={isEmpty || commentMutation.isPending}
        >
          {commentMutation.isPending
            ? "Posting..."
            : "Post comment"}
        </button>
      </div>
    </form>
  );
}