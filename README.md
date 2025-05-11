# CRUD API

## Description

This is a simple CRUD (Create, Read, Update, Delete) API built with Node.js and TypeScript. The application allows managing users with the following attributes:
- `id` (string, UUID)
- `username` (string)
- `age` (number)
- `hobbies` (array of strings)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/natapage/Simple-CRUD-API.git
   cd crud-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
To run the application in development mode:
```bash
npm run start:dev
```

### Production Mode
To run the application in production mode:
```bash
npm run start:prod
```

### Multi-Process Mode
To run the application in multi-process mode:
```bash
npm run start:multi
```

In multi-process mode, the application uses the `cluster` module to create multiple worker processes. A load balancer is started on the main port (e.g., `4000`), and it distributes incoming requests across the worker processes running on separate ports. The number of workers is determined by the number of CPU cores available on the machine.


## API Endpoints

The API provides the following endpoints:

- `GET /api/users`
  Retrieves a list of all users.

- `GET /api/users/{userId}`
  Retrieves a user by their unique ID.
  **Response Codes**:
  - `200`: User found
  - `400`: Invalid UUID
  - `404`: User not found

- `POST /api/users`
  Creates a new user.
  **Request Body**:
  ```json
  {
    "username": "string",
    "age": "number",
    "hobbies": ["string"]
  }
  ```
  **Response Codes**:
  - `201`: User created
  - `400`: Invalid request body

- `PUT /api/users/{userId}`
  Updates an existing user.
  **Request Body**:
  ```json
  {
    "username": "string",
    "age": "number",
    "hobbies": ["string"]
  }
  ```
  **Response Codes**:
  - `200`: User updated
  - `400`: Invalid UUID or request body
  - `404`: User not found

- `DELETE /api/users/{userId}`
  Deletes a user by their unique ID.
  **Response Codes**:
  - `204`: User deleted
  - `400`: Invalid UUID
  - `404`: User not found

## Notes

- Ensure the `PORT` specified in the `.env` file is not already in use.
- The application uses TypeScript for type safety and better development experience.
- Horizontal scaling is implemented using a load balancer with Node.js `cluster` module.

## Testing

The application includes tests for the API. To run the tests:
```bash
npm test
```
