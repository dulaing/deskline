import type {
  Message,
  Request,
  User,
} from "../features/requests/types";

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
  {
    id: "request-2",
    title: "Laptop overheats during video calls",
    status: "pending",
    priority: "high",
    category: "hardware",
    requesterId: "user-1",
    assigneeId: "user-2",
    createdAt: "2026-07-22T08:30:00.000Z",
    updatedAt: "2026-07-28T10:15:00.000Z",
  },
  {
    id: "request-3",
    title: "Payroll application will not open",
    status: "closed",
    priority: "medium",
    category: "software",
    requesterId: "user-1",
    assigneeId: "user-3",
    createdAt: "2026-07-20T07:45:00.000Z",
    updatedAt: "2026-07-25T13:20:00.000Z",
  },
  {
    id: "request-4",
    title: "Broken light above workstation",
    status: "cancelled",
    priority: "low",
    category: "facilities",
    requesterId: "user-1",
    assigneeId: null,
    createdAt: "2026-07-24T09:10:00.000Z",
    updatedAt: "2026-07-24T11:05:00.000Z",
  },
  {
    id: "request-5",
    title: "Cannot access shared email inbox",
    status: "open",
    priority: "medium",
    category: "access",
    requesterId: "user-1",
    assigneeId: "user-2",
    createdAt: "2026-07-26T06:25:00.000Z",
    updatedAt: "2026-07-27T14:40:00.000Z",
  },
  {
    id: "request-6",
    title: "Meeting room display has no signal",
    status: "pending",
    priority: "medium",
    category: "hardware",
    requesterId: "user-1",
    assigneeId: "user-3",
    createdAt: "2026-07-27T05:50:00.000Z",
    updatedAt: "2026-07-28T08:35:00.000Z",
  },
  {
    id: "request-7",
    title: "Design software license expired",
    status: "closed",
    priority: "low",
    category: "software",
    requesterId: "user-1",
    assigneeId: "user-2",
    createdAt: "2026-07-18T12:00:00.000Z",
    updatedAt: "2026-07-23T09:30:00.000Z",
  },
  {
    id: "request-8",
    title: "Air conditioner leaking near desks",
    status: "open",
    priority: "high",
    category: "facilities",
    requesterId: "user-1",
    assigneeId: null,
    createdAt: "2026-07-28T04:15:00.000Z",
    updatedAt: "2026-07-28T04:15:00.000Z",
  },
];

const descriptions: Record<string, string> = {
  "request-1":
    "The VPN disconnects every few minutes on both Wi-Fi and ethernet.",
  "request-2":
    "The laptop becomes very hot and slows down during video calls.",
  "request-3":
    "The payroll application closes immediately after I try to open it.",
  "request-4":
    "The ceiling light above my workstation is flickering and no longer works.",
  "request-5":
    "I receive an access denied message when opening the shared inbox.",
  "request-6":
    "The meeting room screen reports no signal for every connected laptop.",
  "request-7":
    "The design application reports that its team license has expired.",
  "request-8":
    "Water is leaking from the air conditioner close to the desks.",
};

export const messages: Message[] = requests.map(
  (request, index) => ({
    id: `message-${index + 1}`,
    requestId: request.id,
    authorId: request.requesterId,
    body:
      descriptions[request.id] ??
      "The requester did not provide a description.",
    createdAt: request.createdAt,
  }),
);
