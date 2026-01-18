import { render } from './render';

function changed(a, b) {
    return typeof a !== typeof b ||
        (typeof a === 'string' && a !== b) ||
        a.type !== b.type;
}

export function updateElement($parent, newVNode, oldVNode, index = 0) {
    if (!oldVNode) {
        $parent.appendChild(render(newVNode));
    } else if (!newVNode) {
        $parent.removeChild($parent.childNodes[index]);
    } else if (changed(newVNode, oldVNode)) {
        $parent.replaceChild(render(newVNode), $parent.childNodes[index]);
    } else if (newVNode.type) {
        const newLen = newVNode.children.length;
        const oldLen = oldVNode.children.length;

        for (let i = 0; i < newLen || i < oldLen; i++) {
            updateElement(
                $parent.childNodes[index],
                newVNode.children[i],
                oldVNode.children[i],
                i
            );
        }
    }
}
