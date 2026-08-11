import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { getSession } from "../auth/session";
import type {Category, Message, Priority, Request} from "./types";

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createRequest } from "../../api/requestApi"

type TouchedFields = {
  title: boolean;
  description: boolean;
};

export function NewRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = getSession()?.user ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("hardware");
  const [priority, setPriority] = useState<Priority>("medium");
  const [touched, setTouched] = useState<TouchedFields>({
    title: false,
    description: false,
  });

  const createMutation = useMutation({
    mutationFn: createRequest,

    onSuccess: (detail) => {
      queryClient.setQueryData(
        ["request", detail.request.id],
        detail,
      );

      void queryClient.invalidateQueries({
        queryKey: ["requests"],
      });

      navigate(`/requests/${detail.request.id}`);
    },
  });

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "requester") {
    return <Navigate to="/queue" replace />;
  }

  const requester = currentUser;

  const titleError = title.trim().length < 3 ? "Enter at least 3 characters." : "";

  const descriptionError = description.trim().length < 10 ? "Enter at least 10 characters." : "";

  const isValid = !titleError && !descriptionError;

  function handleSubmit(event: SubmitEvent<HTMLFormElement> ): void {
    event.preventDefault();

    if (!isValid) {
      setTouched({ title: true, description: true});
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
    });
  }

  const showTitleError = touched.title && Boolean(titleError);
  const showDescriptionError = touched.description && Boolean(descriptionError);

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow"> Requester </p>
          <h1> Create a request </h1>
          <p> Tell the support team what happened and how urgent it is. </p>
        </div> <Link to="/my-requests"> Back to my request </Link>
      </div>

      <form
        className="request-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="form-field">
          <label htmlFor="request-title">Title</label>
          <input
            id="request-title"
            name="title"
            type="text"
            value={title}
            disabled={createMutation.isPending}
            placeholder="Example: VPN disconnects repeatedly"
            aria-invalid={showTitleError}
            aria-describedby={showTitleError ? "request-title-error" : undefined}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTouched((current) => ({...current, title: true}))}
          />
          {showTitleError && (
            <p
              className="field-error"
              id="request-title-error"
              role="alert"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="request-description"> Description </label>
          <textarea
            id="request-description"
            name="description"
            rows={6}
            value={description}
            disabled={createMutation.isPending}
            placeholder="Describe the problem and anything you already tried."
            aria-invalid={showDescriptionError}
            aria-describedby={showDescriptionError ? "request-description-error" : "request-description-hint"}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => setTouched((current) => ({...current, description: true}))}
          />
          <p
            className="field-hint"
            id="request-description-hint"
          >
            This becomes the first message in the request.
          </p>
          {showDescriptionError && (
            <p
              className="field-error"
              id="request-description-error"
              role="alert"
            >
              {descriptionError}
            </p>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="request-category">Category</label>
            <select
              id="request-category"
              name="category"
              value={category}
              disabled={createMutation.isPending}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="facilities">Facilities</option>
              <option value="access">Access</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="request-priority">Priority</label>
            <select
              id="request-priority"
              name="priority"
              value={priority}
              disabled={createMutation.isPending}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {createMutation.isError && (
          <p
            className="field-error"
            role="alert"
          >
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "Could not create the request."}
          </p>
        )}

        <div className="form-actions">
          
          <Link className="button-link" to="/my-requests"> Cancel </Link>
          
          <button
            className="button button--primary"
            type="submit"
            disabled={ !isValid || createMutation.isPending }
          >
            {createMutation.isPending
              ? "Creating..."
              : "Create request"}
          </button>

        </div>
      </form>
    </section>
  );
}
