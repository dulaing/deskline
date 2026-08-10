import { delay, http, HttpResponse } from 'msw';
import { messages, requests, users } from './data';
import { toApiMessage, toApiRequest, toApiUser } from './serializers';
import type { ApiLoginInputDto, ApiLoginResponseDto, ApiRequestDetailDto } from '../api/types';
import { getAuthenticatedUser } from "./auth";

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

        const responseBody: ApiRequestDetailDto = {
            request: toApiRequest(desklineRequest),
            messages: requestMessages.map(toApiMessage),
        }

        return HttpResponse.json(responseBody);
    }),
]