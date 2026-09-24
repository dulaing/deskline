// @vitest-environment jsdom

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "../src/api/client";
import { createRequest } from "../src/api/requestApi";
import { clearSession, saveSession } from "../src/features/auth/session";
import { messages, requests, users } from "../src/mocks/data";
import { handlers } from "../src/mocks/handlers";

const server = setupServer(...handlers);
const originalRequests = [...requests];
const originalMessages = [...messages];

const validInput = {
  title: "  New VPN problem  ",
  description: "  The VPN disconnects every five minutes.  ",
  category: "access" as const,
  priority: "high" as const,
};

let originalFetch: typeof globalThis.fetch;

beforeAll(() => {
  originalFetch = globalThis.fetch;
  server.listen({ onUnhandledRequest: "error" });

  const interceptedFetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const normalizedInput =
      typeof input === "string" && input.startsWith("/")
        ? `${window.location.origin}${input}`
        : input;

    return interceptedFetch(normalizedInput, init);
  };
});

afterAll(() => {
  server.close();
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  clearSession();
});

afterEach(() => {
  server.resetHandlers();
  requests.splice(0, requests.length, ...originalRequests);
  messages.splice(0, messages.length, ...originalMessages);
});

describe("POST /requests", () => {
  it("rejects a request without authentication", async () => {
    await expect(createRequest(validInput)).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 401,
        message: "Authentication required.",
      }),
    );
  });

  it("rejects a staff user", async () => {
    const technician = users.find((user) => user.role === "technician");
    expect(technician).toBeDefined();

    saveSession({
      user: technician!,
      token: `deskline-token:${technician!.id}`,
    });

    await expect(createRequest(validInput)).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 403,
        message: "Only requesters can create requests.",
      }),
    );
  });

  it("rejects values below the minimum lengths", async () => {
    const requester = users.find((user) => user.role === "requester");
    expect(requester).toBeDefined();

    saveSession({
      user: requester!,
      token: `deskline-token:${requester!.id}`,
    });

    await expect(
      createRequest({
        ...validInput,
        title: "AB",
        description: "123456789",
      }),
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 400,
        message: "The request information is invalid.",
      }),
    );
  });

  it("creates an open, unassigned request with the description as its first message", async () => {
    const requester = users.find((user) => user.role === "requester");
    expect(requester).toBeDefined();

    saveSession({
      user: requester!,
      token: `deskline-token:${requester!.id}`,
    });

    const detail = await createRequest(validInput);

    expect(detail.request).toMatchObject({
      title: "New VPN problem",
      status: "open",
      priority: "high",
      category: "access",
      requesterId: requester!.id,
      assigneeId: null,
    });
    expect(detail.messages).toHaveLength(1);
    expect(detail.messages[0]).toMatchObject({
      requestId: detail.request.id,
      authorId: requester!.id,
      body: "The VPN disconnects every five minutes.",
    });
    expect(detail.users).toEqual([
      expect.objectContaining({ id: requester!.id }),
    ]);
  });
});
