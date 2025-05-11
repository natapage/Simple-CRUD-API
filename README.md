# Simple-CRUD-API

A simple CRUD API using an in-memory database to manage user records.

## Features

- **Endpoints**:
  - `GET /api/users`: Get all users.
  - `GET /api/users/{userId}`: Get a user by ID.
  - `POST /api/users`: Create a new user.
  - `PUT /api/users/{userId}`: Update a user.
  - `DELETE /api/users/{userId}`: Delete a user.
- **User Object**:
  - `id` (UUID), `username` (string), `age` (number), `hobbies` (array of strings).
- **Error Handling**:
  - 404 for invalid endpoints, 400/500 for request errors.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server in development mode:
   ```bash
   npm run start:dev
   ```
3. Start the server in production mode:
   ```bash
   npm run start:prod
   ```
4. Run tests:
   - Start the server in one terminal:
     ```bash
     npm run start:dev
     ```
   - In another terminal, run:
     ```bash
     npm run test
     ```

## Horizontal Scaling

Start multiple instances with a load balancer:
```bash
npm run start:multi
```
