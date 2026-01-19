import { createElement } from '../vdom/createElement';
import { header } from './Header';
import { allNotes } from './ViewAllNotes';

export function App(state) {
    return createElement(
        'div',
        { class: 'max-w-3xl mx-auto p-8 min-h-screen' },
        state.loading
            ? createElement('div', { class: 'flex justify-center items-center h-64' },
                createElement('h1', { class: 'text-2xl animate-pulse' }, 'Fetching your notes...')
            )
            : [
                ...header(), allNotes()
            ]
    );
}