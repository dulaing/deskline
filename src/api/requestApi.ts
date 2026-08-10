import type { Message, Request, Status } from "../features/requests/types";
import { apiFetch } from "./client";
import { mapApiRequest, mapApiMessage } from "./mappers";
import type { ApiRequestDetailDto, ApiRequestDto, ApiUpdateRequestInputDto } from "./types";

export type RequestDetail = {
    request: Request;
    messages: Message[];
}

export async function getRequests(): Promise<Request[]> {
    const apiRequests = await apiFetch<ApiRequestDto[]>("/requests");

    return apiRequests.map(mapApiRequest);
}

export async function getRequest(id: string): Promise<RequestDetail> {
    const apiDetail = await apiFetch<ApiRequestDetailDto>(`/requests/${encodeURIComponent(id)}`);

    return {
        request: mapApiRequest(apiDetail.request),
        messages: apiDetail.messages.map(mapApiMessage)
    };
}

export type UpdateRequestInput = {
    status?: Status;
    assigneeId?: string | null;
}

export async function updateRequest(id: string, input: UpdateRequestInput): Promise<Request> {
    const apiInput: ApiUpdateRequestInputDto = {
        status: input.status,
        assignee_id: input.assigneeId,
    };

    const apiRequest = await apiFetch<ApiRequestDto>(`/requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(apiInput),
    });

    return mapApiRequest(apiRequest);
}