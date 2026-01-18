import { state } from "../state/store.js";
import { AddForm } from "../components/AddForm.js";
import { App } from "../components/App.js";

export function Router() {
    switch (state.route) {
        case '/create':
            return AddForm();
        default:
            return App();
    }
}
