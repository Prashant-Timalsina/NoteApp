import { createElement } from "../vdom/createElement.js";
import { state, setState } from "../state/store.js";
import { createNote } from "../api/notes.js";

export function AddForm() {
    return createElement(
        'form',
        {
            class: 'flex items-center space-x-4',
            onSubmit: async (e) => {
                e.preventDefault();

                await createNote({
                    title: state.title,
                    note: state.note,
                    user_id: 2
                });

                setState({ title: '', note: '' });
            }
        },

        createElement('input', {
            value: state.title,
            placeholder: 'Title',
            class: 'border p-2 w-full',
            onInput: e => setState({ title: e.target.value })
        }),

        createElement('textarea', {
            value: state.note,
            placeholder: 'Note',
            class: 'border p-2 w-full',
            onInput: e => setState({ note: e.target.value })
        }),

        createElement('button', {
            type: 'submit',
            class: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        }, 'Add Note')
    );
}