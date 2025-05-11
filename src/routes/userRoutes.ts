import { IncomingMessage, ServerResponse } from 'http';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController';

export const userRoutes = (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '';
    const method = req.method || '';

    const routes = [
        { path: '/api/users', method: 'GET', handler: getAllUsers },
        { path: /^\/api\/users\/[\w-]+$/, method: 'GET', handler: getUserById },
        { path: '/api/users', method: 'POST', handler: createUser },
        { path: /^\/api\/users\/[\w-]+$/, method: 'PUT', handler: updateUser },
        { path: /^\/api\/users\/[\w-]+$/, method: 'DELETE', handler: deleteUser },
    ];

    const route = routes.find(
        (r) => (typeof r.path === 'string' ? r.path === url : r.path.test(url)) && r.method === method
    );

    if (route) {
        route.handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint not found' }));
    }
};
