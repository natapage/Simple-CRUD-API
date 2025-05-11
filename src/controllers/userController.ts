import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { validateUuid } from '../utils/validateUuid';
import { users } from '../models/userModel';

const parseRequestBody = async (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => resolve(JSON.parse(body)));
        req.on('error', (err) => reject(err));
    });
};

const sendResponse = (res: ServerResponse, statusCode: number, message: object) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(message));
};

export const getUsers = async () => users;

export const getUser = async (id: string) => users.find((user) => user.id === id);

export const addUser = async (user: { id: string; username: string; age: number; hobbies: string[] }) => {
    users.push(user);
};

export const updateUserInDb = async (id: string, updatedData: { username: string; age: number; hobbies: string[] }) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
    }
};

export const deleteUserFromDb = async (id: string) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
    }
};

export const getAllUsers = async (req: IncomingMessage, res: ServerResponse) => {
    const users = await getUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
};

export const getUserById = async (req: IncomingMessage, res: ServerResponse) => {
    const userId = req.url?.split('/')[3];
    if (!userId || !validateUuid(userId)) {
        sendResponse(res, 400, { message: 'Invalid UUID' });
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        sendResponse(res, 404, { message: 'User not found' });
        return;
    }
    sendResponse(res, 200, user);
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const { username, age, hobbies } = await parseRequestBody(req);
        if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
            sendResponse(res, 400, { message: 'Invalid request body' });
            return;
        }
        const newUser = { id: uuidv4(), username, age, hobbies };
        await addUser(newUser);
        sendResponse(res, 201, newUser);
    } catch {
        sendResponse(res, 400, { message: 'Invalid request body' });
    }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse) => {
    const userId = req.url?.split('/')[3];
    if (!userId || !validateUuid(userId)) {
        sendResponse(res, 400, { message: 'Invalid UUID' });
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        sendResponse(res, 404, { message: 'User not found' });
        return;
    }
    try {
        const { username, age, hobbies } = await parseRequestBody(req);
        if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
            sendResponse(res, 400, { message: 'Invalid request body' });
            return;
        }
        await updateUserInDb(userId, { username, age, hobbies });
        sendResponse(res, 200, { id: userId, username, age, hobbies });
    } catch {
        sendResponse(res, 400, { message: 'Invalid request body' });
    }
};

export const deleteUser = async (req: IncomingMessage, res: ServerResponse) => {
    const userId = req.url?.split('/')[3];
    if (!userId || !validateUuid(userId)) {
        sendResponse(res, 400, { message: 'Invalid UUID' });
        return;
    }
    const user = await getUser(userId);
    if (!user) {
        sendResponse(res, 404, { message: 'User not found' });
        return;
    }
    await deleteUserFromDb(userId);
    res.writeHead(204);
    res.end();
};
