import { http, HttpResponse } from 'msw';

import { users } from './data';

export const handlers = [
    http.get('/users', async () => {
        return HttpResponse.json(users);
    })
]