import { notesState, setNotesState } from '../state/notesStore';
import { setUIState } from '../state/uiStore';
import axios from 'axios';

export async function fetchNotes() {
    setNotesState({ notesLoading: true });

    try {
        const res = await axios.get('/api/notes');

        setNotesState({
            notes: res.data,
            notesLoading: false
        });

    } catch (err) {
        console.error('Fetch failed', err);
        setNotesState({ notesLoading: false });
    }
}

export async function createNote(noteData) {
    try {
        await axios.post('/api/notes', noteData);

        // Refetch notes from server to ensure data consistency
        await fetchNotes();

        setUIState({ route: '/' });
    } catch (err) {
        if (err.response && err.response.status === 422) {
            console.error('Validation Errors:', err.response.data.errors);
        } else {
            console.error('Create failed', err);
        }
    }
}

export async function fetchNote(noteId) {
    try {
        const response = await axios.get(`/api/notes/${noteId}`);
        return response.data;
    }
    catch (err) {
        console.error("Fetch note failed", err);
        return null;
    }
}
