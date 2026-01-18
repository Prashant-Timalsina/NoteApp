import { defineComponent } from '../vdom/component';
import { h } from '../vdom/template';

export const NoteItem = defineComponent({
    props: {
        title: String,
        note: String
    },
    render() {
        return h('li', { class: 'p-4 mb-4 bg-white shadow rounded border-l-4 border-blue-500 list-none' },
            h('h2', { class: 'text-xl font-bold text-gray-800' }, this.title),
            h('p', { class: 'mt-2 text-gray-600' }, this.note)
        );
    }
});
