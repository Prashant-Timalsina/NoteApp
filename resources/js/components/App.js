import { createElement } from '../vdom/createElement';
import { NoteItem } from './NoteItem';

export function App(state) {
    if (state.loading) {
        return createElement(
            'div',
            { class: 'flex justify-center items-center min-h-screen' },
            createElement('h1', { class: 'text-2xl animate-pulse' }, 'Fetching your notes...')
        );
    }

    return createElement(
        'div',
        { class: 'max-w-3xl mx-auto p-8' },
        createElement(
            'header',
            { class: 'mb-8 flex justify-between border-b pb-4' },
            createElement('h1', { class: 'text-3xl font-black' }, 'Laravel VDOM Notes'),
            createElement(
                'span',
                { class: 'bg-blue-100 px-3 py-1 rounded-full text-sm' },
                `${state.notes.length} Notes`
            )
        ),
        createElement(
            'ul',
            {},
            ...(state.notes.length
                ? state.notes.map(NoteItem)
                : [
                    createElement(
                        'div',
                        { class: 'text-center py-12 bg-gray-50 rounded' },
                        createElement('p', { class: 'italic text-gray-500' }, 'No notes found.')
                    )
                ])
        )
    );
}
