// Vue-style h() function (like Vue's createElement)
export function h(type, props = {}, ...children) {
    // Handle component types (Vue-style components)
    if (typeof type === 'function') {
        const componentInstance = type(props || {});
        // If it's a Vue-style component instance, render it
        if (componentInstance && typeof componentInstance.render === 'function') {
            return componentInstance.render();
        }
        // Otherwise, treat it as a render function that returns a vnode
        return componentInstance;
    }

    // Ensure props is an object
    const normalizedProps = props && typeof props === 'object' ? props : {};

    return {
        type,
        props: normalizedProps,
        children: children.flat().filter(child => child !== null && child !== undefined)
    };
}

// Helper functions for Vue-style directives
export function vIf(condition, node) {
    return condition ? node : null;
}

export function vFor(list, renderFn) {
    if (!Array.isArray(list)) return [];
    return list.map((item, index) => renderFn(item, index));
}

export function vModel(ctx, propName) {
    return {
        value: ctx[propName],
        onInput: (e) => {
            ctx[propName] = e.target.value;
        }
    };
}
