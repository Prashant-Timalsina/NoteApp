import { createElement } from "../vdom/createElement";
import { setState, state } from "../state/store";
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
        { class: 'flex flex-col items-center justify-center min-h-screen p-8' },
        createElement("button",
            {
                class: 'bg-slate-800 text-white px-4 py-2 mb-8 hover:bg-slate-700', onclick: () => {
                    setState({
                        route: '/',
                        noteId: null,
                        title: '',
                        note: ''
                    })
                }
            },
            "← Back"
        ),
        createElement(
            "h1",
            { class: "font-bold text-3xl mb-4 max-w-3xl" },
            cachedNote.title
        ),
        createElement(
            "p",
            { class: "text-lg text-gray-700 max-w-2xl" },
            cachedNote.note
        )
    );
}

export async function loadNote(noteId) {
    cachedNote = await fetchNote(noteId);
}