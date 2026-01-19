export const notesState = {
    notes: [],
    notesLoading: true,
    notesError: null,
    title: '',
    note: '',
    noteId: null
};

let listeners = [];

export function setNotesState(partialState) {
    Object.assign(notesState, partialState);
    listeners.forEach(fn => fn());
}

export function subscribeNotes(fn) {
    listeners.push(fn);
}

export function clearNotesListeners() {
    listeners = [];
}
