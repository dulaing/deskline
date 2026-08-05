import { delay, http, HttpResponse } from 'msw';

import { users } from './data';

export const handlers = [
    http.get('/users', async () => {
        await delay(500); // Simulate network delay
        const safeUsers = users.map((user) =>({
            id: user.id,
            name: user.name,
            email: user.email, //passwords are excluded
            role: user.role,
        }))
        return HttpResponse.json(safeUsers);
    })
]