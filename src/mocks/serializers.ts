import type { ApiMessageDto, ApiRequestDto, ApiUserDto } from "../api/types";
import type { Message, Request, User } from "../features/requests/types";

export function toApiRequest(request: Request): ApiRequestDto {
    return{
        id: request.id,
        title: request.title,
        status: request.status,
        priority: request.priority,
        category: request.category,
        requester_id: request.requesterId,
        assignee_id: request.assigneeId,
        created_at: request.createdAt,
        updated_at: request.updatedAt
    }
}

export function toApiMessage(message: Message): ApiMessageDto {
    return {
        id: message.id,
        request_id: message.requestId,
        author_id: message.authorId,
        body: message.body,
        created_at: message.createdAt
    }
}

export function toApiUser(user: User): ApiUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}