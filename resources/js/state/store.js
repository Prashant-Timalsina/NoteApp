export const state = {
    notes: [],
    loading: true,
    title: '',
    note:'',
    route: '/'
};

let Listeners = [];

export function setState(partialState){
    Object.assign(state, partialState);
    Listeners.forEach(fn=>fn());
}

export function subscribe(fn){
    Listeners.push(fn);
}
