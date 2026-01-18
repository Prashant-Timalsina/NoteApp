import { createElement } from '../vdom/createElement';

export function NoteItem({ title, note }) {
    return createElement(
        'li',
        { class: 'p-4 mb-4 bg-white shadow rounded border-l-4 border-blue-500 list-none' },
        createElement('h2', { class: 'text-xl font-bold text-gray-800' }, title),
        createElement('p', { class: 'mt-2 text-gray-600' }, note)
    );
}
