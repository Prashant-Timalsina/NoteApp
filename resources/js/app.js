import './bootstrap';

import { render } from './vdom/render';
import { updateElement } from './vdom/diff';
import { fetchNotes } from './api/notes';
import { Router } from "./router/router.js";
import { subscribe } from "./state/store.js";

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
    subscribe(updateUI);
    await fetchNotes();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();