import './bootstrap';

import { render } from './vdom/render';
import { updateElement } from './vdom/diff';
import { fetchNotes } from './api/notes';
import { Router } from "./router/router.js";
import { subscribe, state } from "./state/store.js";
import { effect } from './vdom/reactive';

let currentVDom = null;
let currentComponentInstance = null;

function updateUI() {
    const root = document.getElementById('app');

    // Get component instance from router
    const componentInstance = Router();

    // Update component data from global state
    if (componentInstance.data) {
        Object.keys(state).forEach(key => {
            if (componentInstance.data.hasOwnProperty(key)) {
                componentInstance.data[key] = state[key];
            }
        });
    }

    // Render the component
    const newVDom = componentInstance.render();

    if (!currentVDom) {
        root.innerHTML = '';
        root.appendChild(render(newVDom));
    } else {
        updateElement(root, newVDom, currentVDom);
    }

    currentVDom = newVDom;
    currentComponentInstance = componentInstance;
}

async function init() {
    // Use reactive effect to watch for state changes
    effect(() => {
        // Access state properties to create dependencies
        const _ = state.notes;
        const __ = state.loading;
        const ___ = state.route;
        const ____ = state.title;
        const _____ = state.note;
        updateUI();
    });

    await fetchNotes();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
