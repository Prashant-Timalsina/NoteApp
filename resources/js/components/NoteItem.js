import { createElement } from '../vdom/createElement';
import { setState } from '../state/store';
import { loadNote } from './ViewNote';

export function NoteItem({ title, note, id }) {
    const noteData = (note && note.length > 300) ? note.substring(0, 300) + "..." : note;
    return createElement(
        'li',
        { class: 'p-4 mb-4 bg-white shadow rounded border-l-4 border-blue-500 list-none' },
        createElement('h2', { class: 'text-xl font-bold text-gray-800 truncate w-[50vw]' }, title),
        createElement('p', { class: 'mt-2 text-gray-600' }, noteData),
        createElement(
            'div',
            { class: 'flex flex-row px-2 py-3 m-2' },
            createElement(
                'button',
                {
                    class: 'btn bg-red-300 hover:bg-red-500 hover:cursor-pointer items-center justify-center',
                    onclick: async () => {
                        await loadNote(id);
                        setState({ route: '/view', noteId: id });
                    }
                },
                "View this"
            )
        )
    );
}