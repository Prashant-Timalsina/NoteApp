import { createElement } from '../vdom/createElement';
import { NoteItem } from './NoteItem';
import { setState } from "../state/store.js";

export function App(state) {
    return createElement(
        'div',
        { class: 'max-w-3xl mx-auto p-8 min-h-screen' },
        // Always render the header (or a placeholder) to keep the child index stable
        state.loading
            ? createElement('div', { class: 'flex justify-center items-center h-64' },
                createElement('h1', { class: 'text-2xl animate-pulse' }, 'Fetching your notes...')
            )
            : [
                createElement(
                    'header',
                    { class: 'mb-8 flex justify-between border-b pb-4' },
                    createElement('h1', { class: 'text-3xl font-black' }, 'Laravel VDOM Notes'),
                    createElement(
                        'span',
                        { class: 'bg-blue-100 px-3 py-1 rounded-full text-sm' },
                        `${state.notes.length} Notes`
                    ),
                    createElement(
                        'button',
                        {
                            class: 'bg-green-500 text-white px-4 py-2',
                            onClick: () => setState({ route: '/create' })
                        },
                        'Create Note'
                    )

                ),
                createElement(
                    'ul',
                    { class: 'space-y-4' },
                    ...(state.notes.length
                        ? state.notes.map(note => NoteItem(note))
                        : [
                            createElement(
                                'div',
                                { class: 'text-center py-12 bg-gray-50 rounded' },
                                createElement('p', { class: 'italic text-gray-500' }, 'No notes found.')
                            )
                        ])
                )
            ]
    );
}