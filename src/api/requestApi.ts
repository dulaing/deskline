import type { Message, Request} from "../features/requests/types";
import { apiFetch } from "./client";
import { mapApiRequest, mapApiMessage } from "./mappers";
import type { ApiRequestDetailDto, ApiRequestDto } from "./types";

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