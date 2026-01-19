import { setState, state } from "../state/store";
import { createElement } from "../vdom/createElement";

export function header() {
    return [
        createElement(
            'header',
            { class: 'mb-8 flex justify-between border-b pb-4' },
            createElement('h1', { class: 'text-3xl font-black' }, 'Laravel VDOM Notes'),
            createElement(
                'span',
                { class: 'bg-blue-100 px-3 py-1 rounded-full text-sm' },
                `${state.notes.length} Notes`
            ),
            createElement(
                'button',
                {
                    class: 'bg-green-500 text-white px-4 py-2',
                    onClick: () => setState({ route: '/create' })
                },
                'Create Note'
            )

        ),
    ];
}