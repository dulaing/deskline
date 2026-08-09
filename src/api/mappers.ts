import type { Message, Request, User} from "../features/requests/types";
import type { ApiMessageDto, ApiRequestDto, ApiUserDto } from "./types";

export function mapApiRequest(apiRequest: ApiRequestDto): Request {
  return {
    id: apiRequest.id,
    title: apiRequest.title,
    status: apiRequest.status,
    priority: apiRequest.priority,
    category: apiRequest.category,
    requesterId: apiRequest.requester_id,
    assigneeId: apiRequest.assignee_id,
    createdAt: apiRequest.created_at,
    updatedAt: apiRequest.updated_at,
  };
}

export function mapApiMessage(apiMessage: ApiMessageDto): Message {
  return {
    id: apiMessage.id,
    requestId: apiMessage.request_id,
    authorId: apiMessage.author_id,
    body: apiMessage.body,
    createdAt: apiMessage.created_at,
  };
}

export function mapApiUser(apiUser: ApiUserDto): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
  }
}