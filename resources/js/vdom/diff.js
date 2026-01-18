import { render } from './render';

export function changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
        (typeof node1 === 'string' && node1 !== node2) ||
        node1.type !== node2.type;
}

export function updateElement($parent, newVNode, oldVNode, index = 0) {
    if (!oldVNode) {
        $parent.appendChild(render(newVNode));
    } else if (!newVNode) {
        if ($parent.childNodes[index]) {
            $parent.removeChild($parent.childNodes[index]);
        }
    } else if (changed(newVNode, oldVNode)) {
        $parent.replaceChild(render(newVNode), $parent.childNodes[index]);
    } else if (newVNode.type) {
        const $el = $parent.childNodes[index];

        // Update attributes/props
        const props = { ...oldVNode.props, ...newVNode.props };
        Object.keys(props).forEach(name => {
            if (newVNode.props[name] !== oldVNode.props[name]) {
                if (name === 'value') {
                    $el.value = newVNode.props[name];
                } else if (name.startsWith('on')) {
                    // Remove old event listener and add new one
                    const eventName = name.toLowerCase().substring(2);
                    if (oldVNode.props[name]) {
                        $el.removeEventListener(eventName, oldVNode.props[name]);
                    }
                    $el.addEventListener(eventName, newVNode.props[name]);
                } else {
                    $el.setAttribute(name === 'class' ? 'class' : name, newVNode.props[name]);
                }
            }
        });

        const newLen = newVNode.children.length;
        const oldLen = oldVNode.children.length;

        for (let i = 0; i < newLen || i < oldLen; i++) {
            updateElement(
                $el,
                newVNode.children[i],
                oldVNode.children[i],
                i
            );
        }
    }
}
