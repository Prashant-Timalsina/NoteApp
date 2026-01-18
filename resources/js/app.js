import './bootstrap';

import { state } from './state/store';
import { App } from './components/App';
import { render } from './vdom/render';
import { updateElement } from './vdom/diff';
import { fetchNotes } from './api/notes';

let currentVDom = null;

function updateUI() {
    const root = document.getElementById('app');
    if (!root) return;

    const newVDom = App(state);

    if (!currentVDom) {
        root.innerHTML = '';
        root.appendChild(render(newVDom));
    } else {
        updateElement(root, newVDom, currentVDom);
    }

    currentVDom = newVDom;
}

async function init() {
    updateUI();
    await fetchNotes(updateUI);
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
