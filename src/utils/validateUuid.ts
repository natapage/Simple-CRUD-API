import { validate } from 'uuid';

export const validateUuid = (id: string): boolean => validate(id);
