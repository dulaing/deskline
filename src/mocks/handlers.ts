import { delay, http, HttpResponse } from 'msw';
import { messages, requests, users } from './data';
import { toApiMessage, toApiRequest, toApiUser } from './serializers';
import type { ApiLoginInputDto, ApiLoginResponseDto, ApiRequestDetailDto } from '../api/types';

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

    http.get('/users', async () => {
        await delay(1500); // Simulate network delay

        return HttpResponse.json(users.map(toApiUser));
    }),

    http.get('/requests', async () => {
        await delay(1500); // Simulate network delay
        const apiRequests = requests.map(toApiRequest);
        return HttpResponse.json(apiRequests);
    }),

    // MSW passes an object to the handler. { params } extracts its params property using object destructuring.
    http.get('/requests/:id', async ({ params}) => {
        await delay(1500); // Simulate network delay
        const requestId = String(params.id);
        const request = requests.find((candidate) => candidate.id === requestId);

        if (!request) {
            return HttpResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        const requestMessages = messages.filter((message) => message.requestId === requestId);

        const responseBody: ApiRequestDetailDto = {
            request: toApiRequest(request),
            messages: requestMessages.map(toApiMessage),
        }

        return HttpResponse.json(responseBody);
    }),


]