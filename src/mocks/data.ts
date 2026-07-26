import type { Request, User } from "../features/requests/types";

export const users: User[] = [
  {
    id: "user-1",
    name: "Ravi Requester",
    email: "requester@deskline.test",
    password: "password",
    role: "requester",
  },
  {
    id: "user-2",
    name: "Tina Technician",
    email: "technician@deskline.test",
    password: "password",
    role: "technician",
  },
  {
    id: "user-3",
    name: "Amal Admin",
    email: "admin@deskline.test",
    password: "password",
    role: "admin",
  },
];

export const requests: Request[] = [
  {
    id: "request-1",
    title: "VPN disconnects repeatedly",
    status: "open",
    priority: "high",
    category: "access",
    requesterId: "user-1",
    assigneeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];