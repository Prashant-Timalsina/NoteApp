import { state } from "../state/store.js";
import { AddForm } from "../components/AddForm.js";
import { App } from "../components/App.js";
import { view } from "../components/ViewNote.js";

export function Router() {
    switch (state.route) {
        case '/create':
            return AddForm();
        case '/view':
            return view();
        default:
            return App(state)
    }
}
