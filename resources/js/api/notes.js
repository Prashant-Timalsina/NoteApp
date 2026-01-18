import { state } from '../state/store';

export async function fetchNotes(updateUI) {
    try {
        const response = await axios.get('/api/notes');
        state.notes = response.data;
        console.log(response);
    } catch (e) {
        console.error('Failed to fetch notes', e);
    } finally {
        state.loading = false;
        updateUI();
    }
}
