import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import app from '../app';
import { v4 as uuidv4 } from 'uuid';

const PORT = parseInt(process.env.PORT || '4000', 10);
const numCPUs = cpus().length;

const sharedData: Record<string, any> = {};

if (process.env.NODE_ENV === 'development') {
    console.log(`Development mode: Server is running on http://localhost:${PORT}`);
    const server = createServer(app);
    server.listen(PORT, () => {
        console.log(`Server is listening on http://localhost:${PORT}`);
    });
} else if (cluster.isPrimary) {
    console.log(`Primary process is running. PID: ${process.pid}`);

    for (let i = 1; i < numCPUs; i++) {
        cluster.fork({ WORKER_PORT: PORT + i });
    }

    let currentWorker = 0;
    const loadBalancer = createServer((req: IncomingMessage, res: ServerResponse) => {
        const workerPort = PORT + ((currentWorker % (numCPUs - 1)) + 1);
        currentWorker++;

        const options = {
            hostname: 'localhost',
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        const proxy = http.request(options, (workerRes: IncomingMessage) => {
            res.writeHead(workerRes.statusCode || 500, workerRes.headers);
            workerRes.pipe(res, { end: true });
        });

        req.pipe(proxy, { end: true });
        proxy.on('error', (err) => {
            console.error(`Error forwarding request to worker on port ${workerPort}:`, err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        });
    });

    loadBalancer.listen(PORT, () => {
        console.log(`Load balancer is running on http://localhost:${PORT}`);
    });

    cluster.on('message', (worker, message) => {
        const { action, key, value } = message;
        switch (action) {
            case 'set':
                sharedData[key] = value;
                break;
            case 'get':
                worker.send({ action: 'response', key, value: sharedData[key] });
                break;
            case 'delete':
                delete sharedData[key];
                break;
        }
    });

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} exited. Forking a new one.`);
        cluster.fork();
    });
} else {
    const workerPort = parseInt(process.env.WORKER_PORT || '0', 10);
    if (!workerPort) {
        console.error('Worker port not specified.');
        process.exit(1);
    }

    console.log(`Worker process started on port ${workerPort}. PID: ${process.pid}`);

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        if (req.url?.startsWith('/api/users')) {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
                const key = 'user';
                if (req.method === 'POST') {
                    const user = JSON.parse(body);
                    user.id = uuidv4();
                    process.send?.({ action: 'set', key, value: user });
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(user));
                } else if (req.method === 'GET') {
                    process.send?.({ action: 'get', key });
                    process.once('message', (rawMessage) => {
                        const message = rawMessage as { action: string; key: string; value?: any };
                        if (message?.action === 'response' && message.key === key) {
                            if (message.value) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(message.value));
                            } else {
                                res.writeHead(404).end('User not found');
                            }
                        } else {
                            res.writeHead(500).end('Invalid response from primary process');
                        }
                    });
                } else if (req.method === 'DELETE') {
                    process.send?.({ action: 'delete', key });
                    res.writeHead(200).end('User deleted');
                } else {
                    res.writeHead(405).end('Method Not Allowed');
                }
            });
        } else {
            app(req, res);
        }
    });

    server.listen(workerPort, () => {
        console.log(`Worker is listening on http://localhost:${workerPort}`);
    });
}
