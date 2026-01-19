import { setState } from "../state/store";
import { createElement } from "../vdom/createElement";

export function login() {
    return createElement(
        "button",
        {
            class: "bg-green-400 hover:bg-green-500",
            onclick: () => setState({ route: '/login' })
        },
        "Login"
    )
}