// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRequest, type RequestDetail } from "../src/api/requestApi";
import { clearSession, saveSession } from "../src/features/auth/session";
import { NewRequestPage } from "../src/features/requests/NewRequestPage";

vi.mock("../src/api/requestApi", () => ({
  createRequest: vi.fn(),
}));

const mockedCreateRequest = vi.mocked(createRequest);

const requester = {
  id: "user-1",
  name: "Ravi Requester",
  email: "requester@deskline.test",
  role: "requester" as const,
};

const technician = {
  id: "user-2",
  name: "Tina Technician",
  email: "technician@deskline.test",
  role: "technician" as const,
};

const createdDetail: RequestDetail = {
  request: {
    id: "request-test-1",
    title: "VPN issue",
    status: "open",
    priority: "high",
    category: "access",
    requesterId: requester.id,
    assigneeId: null,
    createdAt: "2026-09-21T08:00:00.000Z",
    updatedAt: "2026-09-21T08:00:00.000Z",
  },
  messages: [
    {
      id: "message-test-1",
      requestId: "request-test-1",
      authorId: requester.id,
      body: "VPN disconnects every five minutes.",
      createdAt: "2026-09-21T08:00:00.000Z",
    },
  ],
  users: [requester],
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/requests/new"]}>
        <Routes>
          <Route path="/requests/new" element={<NewRequestPage />} />
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route path="/queue" element={<h1>Queue page</h1>} />
          <Route path="/my-requests" element={<h1>My requests</h1>} />
          <Route path="/requests/:id" element={<h1>Request created</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return queryClient;
}

function saveRequesterSession() {
  saveSession({
    user: requester,
    token: `deskline-token:${requester.id}`,
  });
}

async function enterValidRequest() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Title"), "VPN issue");
  await user.type(
    screen.getByLabelText("Description"),
    "VPN disconnects every five minutes.",
  );

  return user;
}

beforeEach(() => {
  clearSession();
  mockedCreateRequest.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("Create Request page", () => {
  it("redirects a logged-out user to login", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Login page" }),
    ).toBeInTheDocument();
  });

  it("redirects a staff user to the queue", async () => {
    saveSession({
      user: technician,
      token: `deskline-token:${technician.id}`,
    });

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Queue page" }),
    ).toBeInTheDocument();
  });

  it("blocks values below the minimum lengths and explains the errors", async () => {
    saveRequesterSession();
    const user = userEvent.setup();
    renderPage();

    const submitButton = screen.getByRole("button", {
      name: "Create request",
    });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "AB");
    await user.tab();
    await user.type(screen.getByLabelText("Description"), "123456789");
    await user.tab();

    expect(
      screen.getByText("Enter at least 3 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter at least 10 characters."),
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(mockedCreateRequest).not.toHaveBeenCalled();
  });

  it("accepts the exact minimum lengths with the default category and priority", async () => {
    saveRequesterSession();
    mockedCreateRequest.mockResolvedValue(createdDetail);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Title"), "ABC");
    await user.type(screen.getByLabelText("Description"), "1234567890");
    await user.click(screen.getByRole("button", { name: "Create request" }));

    await waitFor(() => {
      expect(mockedCreateRequest.mock.calls[0][0]).toEqual({
        title: "ABC",
        description: "1234567890",
        category: "hardware",
        priority: "medium",
      });
    });
  });

  it("submits trimmed values and opens the created request", async () => {
    saveRequesterSession();
    mockedCreateRequest.mockResolvedValue(createdDetail);
    const queryClient = renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Title"), "  VPN issue  ");
    await user.type(
      screen.getByLabelText("Description"),
      "  VPN disconnects every five minutes.  ",
    );
    await user.selectOptions(screen.getByLabelText("Category"), "access");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.click(screen.getByRole("button", { name: "Create request" }));

    await waitFor(() => {
      expect(mockedCreateRequest).toHaveBeenCalledTimes(1);
      expect(mockedCreateRequest.mock.calls[0][0]).toEqual({
        title: "VPN issue",
        description: "VPN disconnects every five minutes.",
        category: "access",
        priority: "high",
      });
    });
    expect(
      await screen.findByRole("heading", { name: "Request created" }),
    ).toBeInTheDocument();
    expect(
      queryClient.getQueryData(["request", createdDetail.request.id]),
    ).toEqual(createdDetail);
  });

  it("prevents another submission while creation is pending", async () => {
    saveRequesterSession();

    let finishRequest: (detail: RequestDetail) => void = () => undefined;
    mockedCreateRequest.mockImplementation(
      () =>
        new Promise<RequestDetail>((resolve) => {
          finishRequest = resolve;
        }),
    );

    renderPage();
    const user = await enterValidRequest();
    await user.click(screen.getByRole("button", { name: "Create request" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Creating...",
    });
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(mockedCreateRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishRequest(createdDetail);
    });
  });

  it("shows an API error and preserves the entered information", async () => {
    saveRequesterSession();
    mockedCreateRequest.mockRejectedValue(new Error("Service unavailable."));
    renderPage();
    const user = await enterValidRequest();

    await user.click(screen.getByRole("button", { name: "Create request" }));

    expect(await screen.findByText("Service unavailable.")).toHaveRole("alert");
    expect(screen.getByLabelText("Title")).toHaveValue("VPN issue");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "VPN disconnects every five minutes.",
    );
    expect(
      screen.getByRole("button", { name: "Create request" }),
    ).toBeEnabled();
  });
});
