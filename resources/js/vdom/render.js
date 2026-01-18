export function render(vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(String(vNode));
    }

    const $el = document.createElement(vNode.type);

    for (const [key, value] of Object.entries(vNode.props || {})) {
        if (key === 'class') {
            $el.className = String(value);
        } else {
            $el.setAttribute(key, String(value));
        }
    }

    (vNode.children || []).forEach(child => {
        if (child !== null && child !== undefined) {
            $el.appendChild(render(child));
        }
    });

    return $el;
}
