import { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes';

dotenv.config();

const sendResponse = (res: ServerResponse, statusCode: number, message: object) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(message));
};

const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
    try {
        if (req.url?.startsWith('/api/users')) {
            userRoutes(req, res);
        } else {
            sendResponse(res, 404, { message: 'Endpoint not found' });
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
};

export default requestHandler;
