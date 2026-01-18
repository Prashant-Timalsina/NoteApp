export function render(vNode)
{
    if (!vNode) return document.createTextNode(''); // Guard against null/undefined

    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(String(vNode));
    }

    const $el = document.createElement(vNode.type);

    for (const [key, value] of Object.entries(vNode.props || {})) {
        // 🔹 EVENT HANDLERS
        if (key.startsWith('on')) {
            const eventName = key.toLowerCase().substring(2);
            $el.addEventListener(eventName, value);
        } else if (key === 'class') {
            $el.className = String(value);
        } else if (key === 'value') {
            $el.value = value; // Use property instead of attribute for inputs
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
