import axios from 'axios';
import { setUserState, userState } from '../state/userStore';

export async function login(email, password) {
    setUserState({ authLoading: true, authError: null });

    try {
        const res = await axios.post('/api/login', { email, password });

        setUserState({
            user: res.data.user,
            isAuthenticated: true,
            authLoading: false,
            authError: null
        });

        // Store token for future requests
        if (res.data.token) {
            localStorage.setItem('authToken', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }

        return true;
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Login failed';
        setUserState({
            authLoading: false,
            authError: errorMsg,
            isAuthenticated: false,
            user: null
        });
        return false;
    }
}

export async function register(email, password, name) {
    setUserState({ authLoading: true, authError: null });

    try {
        const res = await axios.post('/api/register', { email, password, name });

        setUserState({
            user: res.data.user,
            isAuthenticated: true,
            authLoading: false,
            authError: null
        });

        if (res.data.token) {
            localStorage.setItem('authToken', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }

        return true;
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Registration failed';
        setUserState({
            authLoading: false,
            authError: errorMsg,
            isAuthenticated: false,
            user: null
        });
        return false;
    }
}

export async function logout() {
    try {
        await axios.post('/api/logout');
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setUserState({
            user: null,
            isAuthenticated: false,
            authError: null
        });
    }
}

export async function checkAuth() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        setUserState({ isAuthenticated: false, user: null });
        return false;
    }

    try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/api/user');

        setUserState({
            user: res.data,
            isAuthenticated: true,
            authLoading: false
        });

        return true;
    } catch (err) {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setUserState({
            user: null,
            isAuthenticated: false,
            authLoading: false
        });
        return false;
    }
}
