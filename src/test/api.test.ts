import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/users';

describe('Scenario 1: CRUD API Tests (Full lifecycle of a user)', () => {
    let createdUserId: string;

    it('should return an empty array when getting all users', async () => {
        const response = await axios.get(BASE_URL);
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });

    it('should create a new user', async () => {
        const newUser = { username: 'John Doe', age: 30, hobbies: ['reading', 'gaming'] };
        const response = await axios.post(BASE_URL, newUser);
        expect(response.status).toBe(201);
        expect(response.data).toMatchObject(newUser);
        expect(response.data).toHaveProperty('id');
        createdUserId = response.data.id;
    });

    it('should get the created user by ID', async () => {
        const response = await axios.get(`${BASE_URL}/${createdUserId}`);
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(createdUserId);
    });

    it('should update the created user', async () => {
        const updatedUser = { username: 'Jane Doe', age: 25, hobbies: ['traveling'] };
        const response = await axios.put(`${BASE_URL}/${createdUserId}`, updatedUser);
        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({ id: createdUserId, ...updatedUser });
    });

    it('should delete the created user', async () => {
        const response = await axios.delete(`${BASE_URL}/${createdUserId}`);
        expect(response.status).toBe(204);
    });

    it('should return 404 when trying to get the deleted user', async () => {
        try {
            await axios.get(`${BASE_URL}/${createdUserId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });
});

describe('Scenario 2: Retrieve all users after creating multiple users', () => {
    it('should create multiple users and return them all', async () => {
        const users = [
            { username: 'Alice', age: 28, hobbies: ['painting'] },
            { username: 'Bob', age: 35, hobbies: ['cycling'] }
        ];

        for (const user of users) {
            const response = await axios.post(BASE_URL, user);
            expect(response.status).toBe(201);
        }

        const response = await axios.get(BASE_URL);
        expect(response.status).toBe(200);
        expect(response.data.length).toBeGreaterThanOrEqual(2);
        expect(response.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ username: 'Alice' }),
                expect.objectContaining({ username: 'Bob' })
            ])
        );
    });
});

describe('Scenario 3: Handle invalid user ID operations', () => {
    it('should return 400 for invalid user ID format when retrieving a user', async () => {
        try {
            await axios.get(`${BASE_URL}/invalid-id`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });

    it('should return 400 for invalid user ID format when deleting a user', async () => {
        try {
            await axios.delete(`${BASE_URL}/invalid-id`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });
});
