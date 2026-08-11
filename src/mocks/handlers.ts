import { delay, http, HttpResponse } from 'msw';
import { messages, requests, users } from './data';
import { toApiMessage, toApiRequest, toApiUser } from './serializers';
import type { ApiLoginInputDto, ApiLoginResponseDto, ApiRequestDetailDto, ApiUpdateRequestInputDto, ApiCreateRequestInputDto } from '../api/types';
import { getAuthenticatedUser } from "./auth";
import { canChangeAssignee, canChangeStatus } from './requestRules';
import type { Message as DesklineMessage, 
         Request as DesklineRequest,
} from "../features/requests/types"

export const handlers = [
    http.post("/login", async ({ request }) => {
        await delay(1500);

        const credentials = await request.json() as ApiLoginInputDto;

        const matchedUser = users.find((user) =>
            user.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
            user.password === credentials.password,
        );

        if (!matchedUser) {
            return HttpResponse.json(
            {
                message: "Incorrect email or password.",
            },
            {
                status: 401,
            },
            );
        }

        const responseBody: ApiLoginResponseDto = {
            user: toApiUser(matchedUser),
            token: `deskline-token:${matchedUser.id}`,
        };

        return HttpResponse.json(responseBody);
    }),

    http.get('/users', async ({request}) => {
        await delay(1500); // Simulate network delay

        const currentUser = getAuthenticatedUser(request);

        if (!currentUser) {
            return HttpResponse.json(
                {
                    message: "Authentication required.",
                },
                {
                    status: 401,
                }
            )
        }

        if (currentUser.role == "requester") {
            return HttpResponse.json(
                {
                    message: "You do not have permission to view all users.",
                },
                {
                    status: 403,
                }
            )
        } 

        return HttpResponse.json(users.map(toApiUser));
    }),

    http.get('/requests', async ({request}) => {
        await delay(1500); // Simulate network delay

        const currentUser = getAuthenticatedUser(request);

        if (!currentUser) {
            return HttpResponse.json(
                {
                    message: "Authentication required.",
                },
                {
                    status: 401,
                }
            )
        }
        
        const visibleRequests = currentUser.role === "requester"
            ? requests.filter(
                (desklineRequest) => desklineRequest.requesterId === currentUser.id
            ) : requests;

        return HttpResponse.json(visibleRequests.map(toApiRequest));
    }),

    http.post("/requests", async ({ request }) => {
        await delay(1500);

        const currentUser = getAuthenticatedUser(request);

        if (!currentUser) {
            return HttpResponse.json(
            {
                message: "Authentication required.",
            },
            {
                status: 401,
            },
            );
        }

        if (currentUser.role !== "requester") {
            return HttpResponse.json(
            {
                message: "Only requesters can create requests.",
            },
            {
                status: 403,
            },
            );
        }

        const input = await request.json() as ApiCreateRequestInputDto;

        const hasValidInput =
            typeof input.title === "string" &&
            input.title.trim().length >= 3 &&
            typeof input.description === "string" &&
            input.description.trim().length >= 10 &&
            ["low", "medium", "high"].includes(
            input.priority,
            ) &&
            [
            "hardware",
            "software",
            "facilities",
            "access",
            ].includes(input.category);

        if (!hasValidInput) {
            return HttpResponse.json(
            {
                message: "The request information is invalid.",
            },
            {
                status: 400,
            },
            );
        }

        const now = new Date().toISOString();
        const requestId = `request-${crypto.randomUUID()}`;

        const newRequest: DesklineRequest = {
            id: requestId,
            title: input.title.trim(),
            status: "open",
            priority: input.priority,
            category: input.category,
            requesterId: currentUser.id,
            assigneeId: null,
            createdAt: now,
            updatedAt: now,
        };

        const firstMessage: DesklineMessage = {
            id: `message-${crypto.randomUUID()}`,
            requestId,
            authorId: currentUser.id,
            body: input.description.trim(),
            createdAt: now,
        };

        requests.unshift(newRequest);
        messages.push(firstMessage);

        const responseBody: ApiRequestDetailDto = {
            request: toApiRequest(newRequest),
            messages: [toApiMessage(firstMessage)],
            users: [toApiUser(currentUser)],
        };

        return HttpResponse.json(
            responseBody,
            {
                status: 201,
            },
        );
    }),

    // MSW passes an object to the handler. { params } extracts its params property using object destructuring.
    http.get('/requests/:id', async ({ params, request }) => {
        await delay(1500); // Simulate network delay
        
        const currentUser = getAuthenticatedUser(request);

        if (!currentUser) {
            return HttpResponse.json(
                {
                    message: "Authentication required.",
                },
                {
                    status: 401,
                }
            )
        }

        const requestId = String(params.id);

        const desklineRequest = requests.find((candidate) => candidate.id === requestId);

        if (!desklineRequest) {
            return HttpResponse.json(
                { 
                    message: 'Request not found' 
                },
                {
                    status: 404
                }
            )
        }

        const isStaff = currentUser.role === "technician" || currentUser.role === "admin";

        const ownsRequest = desklineRequest.requesterId === currentUser.id;

        if (!isStaff && !ownsRequest) {
            return HttpResponse.json(
                {
                    message: "You do not have permission to view this request.",
                },
                {
                    status: 403,
                }
            )
        }

        const requestMessages = messages.filter((message) => message.requestId === requestId);

        const relatedUserIds = new Set<string>();

        relatedUserIds.add(desklineRequest.requesterId);

        if (desklineRequest.assigneeId) {
            relatedUserIds.add(desklineRequest.assigneeId);
        }

        for (const message of requestMessages) {
            relatedUserIds.add(message.authorId);
        }

        const relatedUsers = users.filter((user) => relatedUserIds.has(user.id));

        const responseBody: ApiRequestDetailDto = {
            request: toApiRequest(desklineRequest),
            messages: requestMessages.map(toApiMessage),
            users: relatedUsers.map(toApiUser),
        }

        return HttpResponse.json(responseBody);
    }),

    http.post("/requests/:id/messages", async ({ params, request }) => {
        await delay(1500);

        const currentUser =
        getAuthenticatedUser(request);

        if (!currentUser) {
        return HttpResponse.json(
            {
            message: "Authentication required.",
            },
            {
            status: 401,
            },
        );
        }

        const requestId = String(params.id);

        const desklineRequest = requests.find(
            (candidate) => candidate.id === requestId,
        );

        if (!desklineRequest) {
            return HttpResponse.json(
                {
                message: "Request not found.",
                },
                {
                status: 404,
                },
            );
        }

        const isStaff = 
            currentUser.role === "technician" ||
            currentUser.role === "admin";

        const ownsRequest = desklineRequest.requesterId === currentUser.id;

        if (!isStaff && !ownsRequest) {
            return HttpResponse.json(
                {
                    message: "You cannot comment on this request.",
                },
                {
                    status: 403,
                },
            );
        }

        const isReadOnly =
            desklineRequest.status === "closed" ||
            desklineRequest.status === "cancelled";

        if (isReadOnly) {
            return HttpResponse.json(
                {
                message:
                    "This request is read-only.",
                },
                {
                status: 403,
                },
            );
        }

        const input = await request.json() as ApiAddMessageInputDto;

        if (typeof input.body !== "string" || input.body.trim().length === 0) {
            return HttpResponse.json(
                {
                    message: "Enter a comment before submitting.",
                },
                {
                    status: 400,
                },
            );
        }

        const now = new Date().toISOString();

        const newMessage: DesklineMessage = {
            id: `message-${crypto.randomUUID()}`, requestId,
            authorId: currentUser.id,
            body: input.body.trim(),
            createdAt: now,
        };

        messages.push(newMessage);
        desklineRequest.updatedAt = now;

        return HttpResponse.json(
            toApiMessage(newMessage),
            {
                status: 201,
            },
        );
    },
    ),

    http.patch('/requests/:id', async ({ params, request }) => {
        await delay(1500); // Simulate network delay

        const currentUser = getAuthenticatedUser(request);

        if (!currentUser) {
            return HttpResponse.json(
                {
                    message: "Authentication required.",
                },
                {
                    status: 401,
                }
            )
        }

        const requestId = String(params.id);

        const requestIndex = requests.findIndex((candidate) => candidate.id === requestId);

        if (requestIndex < 0) {
            return HttpResponse.json(
                { 
                    message: 'Request not found' 
                },
                {
                    status: 404
                }
            )
        }

        const desklineRequest = requests[requestIndex];

        const input = await request.json() as ApiUpdateRequestInputDto;

        const hasStatusChange = input.status !== undefined

        const hasAssigneeChange = input.assignee_id !== undefined

        if (!hasStatusChange && !hasAssigneeChange) {
            return HttpResponse.json(
                {
                    message: "No changes were provided.",
                },
                {
                    status: 400,
                }
            )
        }

        const isTerminal = desklineRequest.status === "closed" || desklineRequest.status === "cancelled";

        if (isTerminal) {
            return HttpResponse.json(
                {
                    message: "Closed and cancelled requests cannot be changed.",
                },
                {
                    status: 403,
                }
            )
        }

        if (hasStatusChange && !canChangeStatus(currentUser, desklineRequest, input.status!)) {
            return HttpResponse.json(
                {
                    message: "You do not have permission to change the status of this request.",
                },
                {
                    status: 403,
                }
            )
        }

        const nextAssigneeId = input.assignee_id ?? null;

        if (hasAssigneeChange && !canChangeAssignee(currentUser, nextAssigneeId, users)) {
            return HttpResponse.json(
                {
                    message: "You do not have permission to change the assignee of this request.",
                },
                {
                    status: 403,
                }
            )
        }

        const now = new Date().toISOString();

        const previousStatus = desklineRequest.status;

        const updatedRequest = {
            ...desklineRequest,
            status: hasStatusChange ? input.status! : desklineRequest.status,
            assigneeId: hasAssigneeChange ? nextAssigneeId : desklineRequest.assigneeId,
            updatedAt: now,
        }

        requests[requestIndex] = updatedRequest;

        if (hasStatusChange && updatedRequest.status !== previousStatus) {
            messages.push({
                id: `message-${crypto.randomUUID()}`,
                requestId: updatedRequest.id,
                authorId: currentUser.id,
                body: `Status changed from ${previousStatus} to ${updatedRequest.status}.`,
                createdAt: now,
            })
        }

        return HttpResponse.json(toApiRequest(updatedRequest));
    }),
]