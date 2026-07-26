// export makes the type availble to other files

// custom types
export type Role = "requester" | "technician" | "admin";

export type Status =
  | "open"
  | "pending"
  | "closed"
  | "cancelled";

export type Priority = "low" | "medium" | "high";

export type Category =
  | "hardware"
  | "software"
  | "facilities"
  | "access";


// object types
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type Message = {
  id: string;
  requestId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type Request = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: Category;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};