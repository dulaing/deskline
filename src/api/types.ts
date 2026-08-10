export type ApiRequestDto = {
  id: string;
  title: string;
  status: "open" | "pending" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  category: "hardware" | "software" | "facilities" | "access";
  requester_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiMessageDto = {
  id: string;
  request_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type ApiRequestDetailDto = {
  request: ApiRequestDto;
  messages: ApiMessageDto[];
};

export type ApiUserDto = {
  id: string;
  name: string;
  email: string;
  role: "requester" | "technician" | "admin";
};

export type ApiLoginInputDto = {
  email: string;
  password: string;
};

export type ApiLoginResponseDto = {
  user: ApiUserDto;
  token: string;
};

export type ApiUpdateRequestInputDto = {
  status?: ApiRequestDto["status"];
  assignee_id?: string | null;
}