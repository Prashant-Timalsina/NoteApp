import { createElement } from '../vdom/createElement';
import { setUIState } from '../state/uiStore';
import { setNotesState } from '../state/notesStore';
import { loadNote } from './ViewNote';

export function NoteItem({ title, note, id }) {
    const noteData = (note && note.length > 300) ? note.substring(0, 300) + "..." : note;
    return createElement(
        'li',
        { class: 'p-4 mb-4 bg-white shadow rounded border-l-4 border-blue-500 list-none' },
        createElement('h2', { class: 'text-xl font-bold text-gray-800 truncate' }, title),
        createElement('p', { class: 'mt-2 text-gray-600' }, noteData),
        createElement(
            'div',
            { class: 'flex flex-row px-2 py-3 m-2' },
            createElement(
                'button',
                {
                    class: 'btn bg-blue-300 hover:bg-blue-500 hover:cursor-pointer items-center justify-center px-4 py-2 rounded',
                    onClick: async () => {
                        await loadNote(id);
                        setUIState({ route: '/view', noteId: id });
                        setNotesState({ noteId: id });
                    }
                },
                "View"
            )
        )
    );
}