import { uiState } from "../state/uiStore.js";
import { userState } from "../state/userStore.js";
import { AddForm } from "../components/AddForm.js";
import { App } from "../components/App.js";
import { view } from "../components/ViewNote.js";
import { LoginForm } from "../components/Login.js";
import { RegisterForm } from "../components/Register.js";

export function Router() {
    // If not authenticated, show auth pages only
    if (!userState.isAuthenticated) {
        switch (uiState.route) {
            case '/register':
                return RegisterForm();
            default:
                return LoginForm();
        }
    }

    // If authenticated, show app pages
    switch (uiState.route) {
        case '/create':
            return AddForm();
        case '/view':
            return view();
        default:
            return App();
    }
}
