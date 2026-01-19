import { state } from "../state/store";
import { createElement } from "../vdom/createElement";
import { NoteItem } from "./NoteItem";

export function allNotes() {
    return createElement(
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
    );
}