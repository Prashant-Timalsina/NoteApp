import { setUIState } from "../state/uiStore";
import { notesState } from "../state/notesStore";
import { userState } from "../state/userStore";
import { createElement } from "../vdom/createElement";
import { logout } from "../api/auth";

export function header() {
    return [
        createElement(
            'header',
            { class: 'mb-8 flex justify-between border-b pb-4' },
            createElement('h1', { class: 'text-3xl font-black' }, 'Laravel VDOM Notes'),
            createElement(
                'div',
                { class: 'flex items-center gap-4' },
                createElement(
                    'span',
                    { class: 'text-sm text-gray-600' },
                    `${userState.user?.name || 'User'}`
                ),
                createElement(
                    'span',
                    { class: 'bg-blue-100 px-3 py-1 rounded-full text-sm' },
                    `${notesState.notes.length} Notes`
                ),
                createElement(
                    'button',
                    {
                        class: 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600',
                        onClick: () => setUIState({ route: '/create' })
                    },
                    'Create Note'
                ),
                createElement(
                    'button',
                    {
                        class: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600',
                        onClick: async () => {
                            await logout();
                            setUIState({ route: '/login' });
                        }
                    },
                    'Logout'
                )
            )
        )
    ];
}