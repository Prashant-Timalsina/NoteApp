import { defineComponent } from '../vdom/component';
import { NoteItem } from './NoteItem';
import { state, setState } from "../state/store.js";

export const App = defineComponent({
    data() {
        return {
            notes: [],
            loading: true
        };
    },
    render(h) {
        // Access reactive state directly in render
        const notes = this.notes || [];
        const loading = this.loading;

        return h('div', { class: 'max-w-3xl mx-auto p-8 min-h-screen' },
            loading
                ? h('div', { class: 'flex justify-center items-center h-64' },
                    h('h1', { class: 'text-2xl animate-pulse' }, 'Fetching your notes...')
                )
                : [
                    h('header', { class: 'mb-8 flex justify-between border-b pb-4' },
                        h('h1', { class: 'text-3xl font-black' }, 'Laravel VDOM Notes'),
                        h('span', { class: 'bg-blue-100 px-3 py-1 rounded-full text-sm' },
                            `${notes.length} Notes`
                        ),
                        h('button', {
                            class: 'bg-green-500 text-white px-4 py-2',
                            onClick: () => setState({ route: '/create' })
                        }, 'Create Note')
                    ),
                    h('ul', { class: 'space-y-4' },
                        ...(notes.length
                            ? notes.map(note => h(NoteItem, note))
                            : [
                                h('div', { class: 'text-center py-12 bg-gray-50 rounded' },
                                    h('p', { class: 'italic text-gray-500' }, 'No notes found.')
                                )
                            ])
                    )
                ]
        );
    }
});
