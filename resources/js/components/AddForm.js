import { createElement } from "../vdom/createElement.js";
import { notesState, setNotesState } from "../state/notesStore.js";
import { userState } from "../state/userStore.js";
import { createNote } from "../api/notes.js";

export function AddForm() {
    return createElement(
        'form',
        {
            class: 'max-w-3xl mx-auto p-8 space-y-4',
            onSubmit: async (e) => {
                e.preventDefault();

                await createNote({
                    title: notesState.title,
                    note: notesState.note,
                    user_id: userState.user?.id
                });

                setNotesState({ title: '', note: '' });
            }
        },

        createElement('h1', { class: 'text-2xl font-bold' }, 'Create New Note'),

        createElement('input', {
            value: notesState.title,
            placeholder: 'Title',
            class: 'w-full border p-2 rounded',
            onInput: e => setNotesState({ title: e.target.value })
        }),

        createElement('textarea', {
            value: notesState.note,
            placeholder: 'Note',
            class: 'w-full border p-2 rounded h-48',
            onInput: e => setNotesState({ note: e.target.value })
        }),

        createElement('button', {
            type: 'submit',
            class: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        }, 'Add Note')
    );
}