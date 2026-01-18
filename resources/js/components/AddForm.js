import { defineComponent } from "../vdom/component.js";
import { h } from '../vdom/template';
import { state, setState } from "../state/store.js";
import { createNote } from "../api/notes.js";

export const AddForm = defineComponent({
    data() {
        return {
            title: '',
            note: ''
        };
    },
    methods: {
        async handleSubmit(e) {
            e.preventDefault();
            await createNote({
                title: this.title,
                note: this.note,
                user_id: 2
            });
            setState({ title: '', note: '' });
            this.title = '';
            this.note = '';
        },
        updateTitle(e) {
            this.title = e.target.value;
            setState({ title: e.target.value });
        },
        updateNote(e) {
            this.note = e.target.value;
            setState({ note: e.target.value });
        }
    },
    render() {
        return h('form', {
            class: 'flex items-center space-x-4',
            onSubmit: this.handleSubmit
        },
            h('input', {
                value: this.title || '',
                placeholder: 'Title',
                class: 'border p-2 w-full',
                onInput: this.updateTitle
            }),
            h('textarea', {
                value: this.note || '',
                placeholder: 'Note',
                class: 'border p-2 w-full',
                onInput: this.updateNote
            }),
            h('button', {
                type: 'submit',
                class: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            }, 'Add Note')
        );
    }
});
