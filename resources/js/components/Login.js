import { createElement } from '../vdom/createElement';
import { setUIState } from '../state/uiStore';
import { userState, setUserState } from '../state/userStore';
import { login } from '../api/auth';

export function LoginForm() {
    const formChildren = [
        createElement('h1', { class: 'text-2xl font-bold mb-4' }, 'Login')
    ];

    if (userState.authError) {
        formChildren.push(
            createElement('div', { class: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded' },
                userState.authError
            )
        );
    }

    formChildren.push(
        createElement('input', {
            type: 'email',
            value: userState.email,
            placeholder: 'Email',
            class: 'w-full border p-2 rounded',
            onInput: e => setUserState({ email: e.target.value })
        }),

        createElement('input', {
            type: 'password',
            value: userState.password,
            placeholder: 'Password',
            class: 'w-full border p-2 rounded',
            onInput: e => setUserState({ password: e.target.value })
        }),

        createElement(
            'button',
            {
                type: 'submit',
                class: 'w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50',
                disabled: userState.authLoading
            },
            userState.authLoading ? 'Logging in...' : 'Login'
        ),

        createElement(
            'div',
            { class: 'text-center mt-4 text-sm' },
            "Don't have an account? ",
            createElement(
                'button',
                {
                    type: 'button',
                    class: 'text-blue-500 hover:underline ml-1',
                    onClick: () => setUIState({ route: '/register' })
                },
                'Register here'
            )
        )
    );

    return createElement(
        'div',
        { class: 'max-w-md mx-auto p-8 min-h-screen flex items-center justify-center' },
        createElement(
            'form',
            {
                class: 'w-full bg-white shadow rounded-lg p-6 space-y-4',
                onSubmit: async (e) => {
                    e.preventDefault();
                    const success = await login(userState.email, userState.password);
                    if (success) {
                        setUIState({ route: '/' });
                    }
                }
            },
            ...formChildren
        )
    );
}
