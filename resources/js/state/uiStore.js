export const uiState = {
    route: '/login',
    loading: false
};

let listeners = [];

export function setUIState(partialState) {
    Object.assign(uiState, partialState);
    listeners.forEach(fn => fn());
}

export function subscribeUI(fn) {
    listeners.push(fn);
}

export function clearUIListeners() {
    listeners = [];
}
