import './bootstrap';

import { render } from './vdom/render';
import { updateElement } from './vdom/diff';
import { fetchNotes } from './api/notes';
import { checkAuth } from './api/auth';
import { Router } from "./router/router.js";
import { subscribeUser } from "./state/userStore.js";
import { subscribeNotes } from "./state/notesStore.js";
import { subscribeUI } from "./state/uiStore.js";
import { setUIState } from "./state/uiStore.js";

let currentVDom = null;

function updateUI() {
    const root = document.getElementById('app');
    const newVDom = Router();

    if (!currentVDom) {
        root.innerHTML = '';
        root.appendChild(render(newVDom));
    } else {
        updateElement(root, newVDom, currentVDom);
    }

    currentVDom = newVDom;
}

async function init() {
    subscribeUser(updateUI);
    subscribeNotes(updateUI);
    subscribeUI(updateUI);

    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await fetchNotes();
        setUIState({ route: '/' });
    } else {
        setUIState({ route: '/login' });
    }
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
