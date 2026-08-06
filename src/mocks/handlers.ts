import { delay, http, HttpResponse } from 'msw';
import type { ApiRequestDetailDto } from '../api/types';
import { messages, requests, users } from './data';
import { toApiMessage, toApiRequest } from './serializers';

export const handlers = [
    http.get('/users', async () => {
        await delay(1500); // Simulate network delay
        const safeUsers = users.map((user) =>({
            id: user.id,
            name: user.name,
            email: user.email, //passwords are excluded
            role: user.role,
        }))
        return HttpResponse.json(safeUsers);
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