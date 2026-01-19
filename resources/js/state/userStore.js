export const userState = {
    user: null,           // { id, email, name } when logged in
    isAuthenticated: false,
    authLoading: false,
    authError: null,
    email: '',
    password: '',
    name: ''
};

let listeners = [];

export function setUserState(partialState) {
    Object.assign(userState, partialState);
    listeners.forEach(fn => fn());
}

export function subscribeUser(fn) {
    listeners.push(fn);
}

export function clearUserListeners() {
    listeners = [];
}
