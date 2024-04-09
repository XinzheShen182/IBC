import api from './apiConfig';

import { localStorageSetItem } from "@/utils/localStorage";

export const login = async (email: string, password: string): Promise<{
    isSuccess: boolean,
    username?: string;
    email?: string;
    role?: string;
    id?: string;
}> => {
    // Mock Mode

    // return {
    //     isSuccess: true,
    //     username: 'admin',
    //     email: 'admin@blockchain.com'
    // }

    const response = await api.post('/login', {
        email,
        password,
    });
    // post login logic, set token
    if (response.data.data.token) {
        localStorageSetItem('token', response.data.data.token);
        return {
            isSuccess: true,
            username: response.data.data.user.username,
            email: response.data.data.user.email,
        };
    } else
        return {
            isSuccess: false,
        };
};

export const register = async ( email: string, username: string, password: string): Promise<boolean> => {

    const response = await api.post('/register', {
        email: email,
        username: username,
        password: password,
    });
    return true;
}