import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/users';

describe('CRUD API Tests', () => {
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
