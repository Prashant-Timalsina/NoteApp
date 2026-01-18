import { state, setState } from '../state/store';


export async function fetchNotes() {
    setState({ loading: true });

    try {
        const res = await axios.get('/api/notes');

        setState({
            notes: res.data,
            loading: false
        });

    } catch (err) {
        console.error('Fetch failed', err);
        setState({ loading: false });
    }
}

export async function createNote(noteData) {
    try {
        await axios.post('/api/notes', noteData);

        // Refetch notes from server to ensure data consistency
        await fetchNotes();

        setState({ route: '/' });
    } catch (err) {
        if (err.response && err.response.status === 422) {
            console.error('Validation Errors:', err.response.data.errors);
        } else {
            console.error('Create failed', err);
        }
    }
}
