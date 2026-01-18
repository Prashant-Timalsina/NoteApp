import { render } from './render';

export function changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
        (typeof node1 === 'string' && node1 !== node2) ||
        (typeof node1 === 'object' && node1 !== null && typeof node2 === 'object' && node2 !== null && node1.type !== node2.type);
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
        const oldProps = oldVNode.props || {};
        const newProps = newVNode.props || {};
        const props = { ...oldProps, ...newProps };
        Object.keys(props).forEach(name => {
            if (newProps[name] !== oldProps[name]) {
                if (name === 'value') {
                    $el.value = newProps[name];
                } else if (name.startsWith('on')) {
                    // Remove old event listener and add new one
                    const eventName = name.toLowerCase().substring(2);
                    if (oldProps[name]) {
                        $el.removeEventListener(eventName, oldProps[name]);
                    }
                    if (newProps[name]) {
                        $el.addEventListener(eventName, newProps[name]);
                    }
                } else {
                    if (newProps[name] !== undefined && newProps[name] !== null) {
                        $el.setAttribute(name === 'class' ? 'class' : name, newProps[name]);
                    } else {
                        $el.removeAttribute(name);
                    }
                }
            }
        });

        const newChildren = newVNode.children || [];
        const oldChildren = oldVNode.children || [];
        const newLen = newChildren.length;
        const oldLen = oldChildren.length;

        for (let i = 0; i < newLen || i < oldLen; i++) {
            updateElement(
                $el,
                newChildren[i],
                oldChildren[i],
                i
            );
        }
    }
}
