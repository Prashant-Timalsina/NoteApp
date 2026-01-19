import { createElement } from "../vdom/createElement";
import { setUIState } from "../state/uiStore";
import { notesState, setNotesState } from "../state/notesStore";
import { fetchNote } from "../api/notes";

let cachedNote = null;

export function view() {
    // Use cached note data
    if (!cachedNote) {
        return createElement("div",
            { class: 'flex flex-col items-center justify-center min-h-screen p-8' },
            createElement("p", { class: "text-gray-500" }, "Loading...")
        );
    }

    return createElement("div",
        { class: 'max-w-3xl mx-auto p-8 min-h-screen' },
        createElement("button",
            {
                class: 'bg-slate-800 text-white px-4 py-2 mb-8 hover:bg-slate-700',
                onClick: () => {
                    cachedNote = null;
                    setUIState({
                        route: '/',
                        noteId: null
                    });
                    setNotesState({
                        noteId: null
                    });
                }
            },
            "← Back"
        ),
        createElement(
            "h1",
            { class: "font-bold text-3xl mb-4" },
            cachedNote.title
        ),
        createElement(
            "p",
            { class: "text-lg text-gray-700 whitespace-pre-wrap" },
            cachedNote.note
        )
    );
}

export async function loadNote(noteId) {
    cachedNote = await fetchNote(noteId);
}