# Code Functions Explained - Vue-Style Framework

## Overview
This document explains **what each function does**, **how it works**, and **when it's called** in the Vue-style VDOM framework.

---

## 📂 File Structure

```
resources/js/
├── app.js                    (Main entry point)
├── bootstrap.js              (Framework setup)
├── state/
│   └── store.js             (Reactive state management)
├── vdom/
│   ├── reactive.js           (Reactivity system)
│   ├── component.js         (Component system)
│   ├── template.js           (h() function and helpers)
│   ├── render.js            (Convert VDOM to HTML)
│   └── diff.js              (Compare and update)
├── components/
│   ├── App.js               (Main app component)
│   ├── AddForm.js           (Note form component)
│   └── NoteItem.js          (Note display component)
├── api/
│   └── notes.js             (Server communication)
└── router/
    └── router.js            (Navigation logic)
```

---

# 🔥 CORE REACTIVITY FUNCTIONS

## 1. `reactive(obj)`

**File:** [resources/js/vdom/reactive.js](resources/js/vdom/reactive.js)

### What It Does
Creates a reactive proxy around an object that tracks property access and automatically triggers effects when properties change.

### Parameters
- `obj` (object) - The object to make reactive

### Returns
A Proxy object that wraps the original object

### How It Works

```javascript
export function reactive(obj) {
    const proxy = new Proxy(obj, {
        get(target, key) {
            // Track dependencies when property is accessed
            if (activeEffect) {
                if (!target._deps) target._deps = {};
                if (!target._deps[key]) target._deps[key] = new Set();
                target._deps[key].add(activeEffect);
            }
            return target[key];
        },
        set(target, key, value) {
            target[key] = value;
            
            // Trigger all effects that depend on this property
            if (target._deps && target._deps[key]) {
                target._deps[key].forEach(effect => effect());
            }
            
            return true;
        }
    });
    
    return proxy;
}
```

### Example Usage

```javascript
const state = reactive({ count: 0, name: 'John' });

// When you access state.count inside an effect,
// it automatically tracks the dependency
effect(() => {
    console.log(state.count); // Tracks dependency on 'count'
});

// When you change state.count, the effect runs again
state.count = 5; // Effect automatically runs!
```

### Why It's Needed
- **Automatic Updates** - UI updates when data changes
- **Dependency Tracking** - Knows which effects depend on which properties
- **Vue-Style Reactivity** - Mimics Vue's reactive system

### Call Chain
```
defineComponent() → reactive(data()) → Proxy object
state/store.js → reactive({ notes, loading, ... }) → Reactive state
```

---

## 2. `effect(fn)`

**File:** [resources/js/vdom/reactive.js](resources/js/vdom/reactive.js)

### What It Does
Runs a function and tracks which reactive properties it accesses. When those properties change, the function runs again automatically.

### Parameters
- `fn` (function) - Function to run and track

### Returns
Nothing (void)

### How It Works

```javascript
export function effect(fn) {
    activeEffect = fn;  // Set current effect being tracked
    fn();                // Run function (tracks dependencies)
    activeEffect = null; // Clear tracking
}
```

### Example Usage

```javascript
const state = reactive({ count: 0 });

effect(() => {
    // This function runs immediately
    console.log(`Count is: ${state.count}`);
    // Accessing state.count creates a dependency
});

state.count = 5; // Function runs again automatically!
// Output: "Count is: 5"
```

### When It's Called
- In `app.js` to watch state changes and update UI
- In `component.js` for computed properties
- Anywhere you need reactive updates

### Why It's Needed
- **Reactive Updates** - Automatically re-run code when dependencies change
- **UI Synchronization** - Keep UI in sync with data
- **Computed Properties** - Recalculate derived values automatically

---

## 3. `ref(value)`

**File:** [resources/js/vdom/reactive.js](resources/js/vdom/reactive.js)

### What It Does
Creates a reactive reference for a single value (like Vue's `ref()`).

### Parameters
- `value` - Any value to wrap in reactivity

### Returns
A reactive object with a `value` property

### Code

```javascript
export function ref(value) {
    return reactive({ value });
}
```

### Example Usage

```javascript
const count = ref(0);

effect(() => {
    console.log(count.value); // Access via .value
});

count.value = 5; // Triggers effect
```

### Why It's Needed
- **Single Value Reactivity** - Make primitives reactive
- **Vue Compatibility** - Matches Vue's `ref()` API
- **Simple Cases** - Easier than wrapping in an object

---

# 🎨 COMPONENT SYSTEM FUNCTIONS

## 4. `defineComponent(options)`

**File:** [resources/js/vdom/component.js](resources/js/vdom/component.js)

### What It Does
Defines a Vue-style component with reactive data, methods, props, computed properties, and lifecycle hooks.

### Parameters
- `options` (object) - Component configuration:
  - `data()` - Function returning initial component data
  - `render(h)` - Render function that returns vnode
  - `methods` - Object with component methods
  - `props` - Object defining component props
  - `computed` - Object with computed properties
  - `created` - Lifecycle hook called when component is created
  - `mounted` - Lifecycle hook called when component is mounted

### Returns
A component constructor function

### How It Works

```javascript
export function defineComponent(options) {
    const { data, render, methods, props, computed, created, mounted } = options;
    
    return function Component(propsData = {}) {
        // Create reactive data
        const componentData = reactive(data());
        
        // Merge props into data
        Object.keys(props).forEach(key => {
            if (propsData[key] !== undefined) {
                componentData[key] = propsData[key];
            }
        });
        
        // Create computed properties with effects
        const computedValues = {};
        Object.keys(computed).forEach(key => {
            let computedValue;
            effect(() => {
                computedValue = computed[key].call(componentData);
            });
            computedValues[key] = computedValue;
        });
        
        // Bind methods to component context
        const boundMethods = {};
        Object.keys(methods).forEach(key => {
            boundMethods[key] = methods[key].bind(componentData);
        });
        
        // Component context (like Vue's 'this')
        const ctx = {
            ...componentData,
            ...boundMethods,
            ...computedValues,
            $props: propsData,
            $h: h
        };
        
        // Lifecycle hooks
        if (created) created.call(ctx);
        
        // Render function
        const renderFn = () => {
            if (render) {
                return render.call(ctx, h);
            }
            return null;
        };
        
        return {
            ctx,
            render: renderFn,
            mount: (el) => {
                const vnode = renderFn();
                if (mounted) mounted.call(ctx, el);
                return vnode;
            },
            data: componentData
        };
    };
}
```

### Example Usage

```javascript
export const App = defineComponent({
    data() {
        return {
            notes: [],
            loading: true
        };
    },
    methods: {
        handleClick() {
            this.notes.push('New note');
        }
    },
    render(h) {
        return h('div', {},
            h('button', { onClick: this.handleClick }, 'Add Note'),
            h('ul', {},
                ...this.notes.map(note => h('li', {}, note))
            )
        );
    }
});
```

### When It's Called
- When defining components (App, AddForm, NoteItem)
- Component is instantiated when used in `h()` or Router

### Why It's Needed
- **Vue-Style Components** - Familiar API for Vue developers
- **Reactive Data** - Component data automatically triggers updates
- **Lifecycle Hooks** - Run code at specific component stages
- **Method Binding** - Methods have access to component data via `this`

---

## 5. `h(type, props, ...children)`

**File:** [resources/js/vdom/template.js](resources/js/vdom/template.js)

### What It Does
Vue-style createElement function. Creates virtual DOM nodes (vnodes). Similar to Vue's `h()` function.

### Parameters
- `type` (string | function) - HTML tag name or component constructor
- `props` (object) - Element properties (class, id, event handlers, etc.)
- `...children` (rest) - Child elements (can be elements, text, or arrays)

### Returns
A vnode object or rendered component vnode

### How It Works

```javascript
export function h(type, props = {}, ...children) {
    // Handle component types (Vue-style components)
    if (typeof type === 'function') {
        const componentInstance = type(props);
        // If it's a Vue-style component instance, render it
        if (componentInstance && componentInstance.render) {
            return componentInstance.render();
        }
        // Otherwise, treat it as a render function
        return componentInstance;
    }
    
    // Regular HTML element
    return {
        type,
        props,
        children: children.flat().filter(child => child !== null && child !== undefined)
    };
}
```

### Example Usage

```javascript
// Simple element
h('div', { class: 'container' }, 'Hello')

// With children
h('div', { class: 'card' },
    h('h1', {}, 'Title'),
    h('p', {}, 'Description')
)

// With component
h(NoteItem, { title: 'My Note', note: 'Content' })

// With event handler
h('button', {
    onClick: () => console.log('clicked')
}, 'Click Me')
```

### When It's Called
- Inside component `render()` functions
- When creating vnodes for the virtual DOM

### Why It's Needed
- **Vue Compatibility** - Same API as Vue's `h()` function
- **Component Support** - Can render components directly
- **Clean Syntax** - More concise than createElement

---

## 6. `vIf(condition, node)`

**File:** [resources/js/vdom/template.js](resources/js/vdom/template.js)

### What It Does
Vue-style conditional rendering helper. Returns the node if condition is true, null otherwise.

### Parameters
- `condition` (boolean) - Whether to render the node
- `node` (vnode) - The node to conditionally render

### Returns
The node if condition is true, null otherwise

### Code

```javascript
export function vIf(condition, node) {
    return condition ? node : null;
}
```

### Example Usage

```javascript
render(h) {
    return h('div', {},
        vIf(this.loading, h('div', {}, 'Loading...')),
        vIf(!this.loading, h('ul', {}, ...this.notes))
    );
}
```

### Why It's Needed
- **Conditional Rendering** - Show/hide elements based on state
- **Vue-Style API** - Matches Vue's `v-if` directive concept

---

## 7. `vFor(list, renderFn)`

**File:** [resources/js/vdom/template.js](resources/js/vdom/template.js)

### What It Does
Vue-style list rendering helper. Maps over a list and renders each item.

### Parameters
- `list` (array) - Array of items to render
- `renderFn` (function) - Function that takes (item, index) and returns a vnode

### Returns
Array of vnodes

### Code

```javascript
export function vFor(list, renderFn) {
    if (!Array.isArray(list)) return [];
    return list.map((item, index) => renderFn(item, index));
}
```

### Example Usage

```javascript
render(h) {
    return h('ul', {},
        ...vFor(this.notes, (note, index) => 
            h('li', { key: index }, note.title)
        )
    );
}
```

### Why It's Needed
- **List Rendering** - Render arrays of items
- **Vue-Style API** - Matches Vue's `v-for` directive concept

---

## 8. `vModel(ctx, propName)`

**File:** [resources/js/vdom/template.js](resources/js/vdom/template.js)

### What It Does
Vue-style two-way binding helper. Returns props for `v-model` binding.

### Parameters
- `ctx` (object) - Component context (reactive data)
- `propName` (string) - Name of the property to bind

### Returns
Object with `value` and `onInput` handler

### Code

```javascript
export function vModel(ctx, propName) {
    return {
        value: ctx[propName],
        onInput: (e) => {
            ctx[propName] = e.target.value;
        }
    };
}
```

### Example Usage

```javascript
render(h) {
    return h('input', {
        ...vModel(this, 'title'),
        placeholder: 'Enter title'
    });
}
```

### Why It's Needed
- **Two-Way Binding** - Sync input value with component data
- **Vue-Style API** - Matches Vue's `v-model` directive concept

---

# 🎯 RENDERING FUNCTIONS

## 9. `render(vNode)`

**File:** [resources/js/vdom/render.js](resources/js/vdom/render.js)

### What It Does
Converts a virtual DOM node into a real DOM element that browsers can display.

### Parameters
- `vNode` - Virtual node (object from `h()`) or text/array

### Returns
Real DOM element or DocumentFragment

### How It Works

```javascript
export function render(vNode) {
    // Handle null/undefined
    if (!vNode) return document.createTextNode('');
    
    // Handle text/numbers
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(String(vNode));
    }
    
    // Handle arrays (fragments)
    if (Array.isArray(vNode)) {
        const fragment = document.createDocumentFragment();
        vNode.forEach(child => {
            if (child !== null && child !== undefined) {
                fragment.appendChild(render(child));
            }
        });
        return fragment;
    }
    
    // Create element
    const $el = document.createElement(vNode.type);
    
    // Set properties
    for (const [key, value] of Object.entries(vNode.props || {})) {
        if (key.startsWith('on')) {
            const eventName = key.toLowerCase().substring(2);
            $el.addEventListener(eventName, value);
        } else if (key === 'class') {
            $el.className = String(value);
        } else if (key === 'value') {
            $el.value = value;
        } else {
            $el.setAttribute(key, String(value));
        }
    }
    
    // Render children recursively
    (vNode.children || []).forEach(child => {
        if (child !== null && child !== undefined) {
            const rendered = render(child);
            if (rendered) {
                $el.appendChild(rendered);
            }
        }
    });
    
    return $el;
}
```

### When It's Called
- First page load (in `app.js`'s `updateUI()`)
- When entire element is replaced (in `diff.js`)
- Recursively for all children

---

## 10. `changed(node1, node2)`

**File:** [resources/js/vdom/diff.js](resources/js/vdom/diff.js)

### What It Does
Checks if two virtual nodes represent different elements.

### Parameters
- `node1` - Old virtual node
- `node2` - New virtual node

### Returns
- `true` - Nodes are different, need to replace
- `false` - Nodes are same type, can update in place

### Code

```javascript
export function changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
        (typeof node1 === 'string' && node1 !== node2) ||
        node1.type !== node2.type;
}
```

---

## 11. `updateElement($parent, newVNode, oldVNode, index)`

**File:** [resources/js/vdom/diff.js](resources/js/vdom/diff.js)

### What It Does
Efficiently updates the DOM by comparing old and new virtual DOM and applying only necessary changes.

### Parameters
- `$parent` - Parent DOM element to update
- `newVNode` - New virtual DOM structure
- `oldVNode` - Old virtual DOM structure
- `index` - Position of element in parent's children

### How It Works
1. If no old node → append new node
2. If no new node → remove old node
3. If node type changed → replace entire node
4. If same type → update properties and recursively update children

---

# 🎨 COMPONENT FUNCTIONS

## 12. `App()`

**File:** [resources/js/components/App.js](resources/js/components/App.js)

### What It Does
Main app component. Displays either a loading message or list of notes.

### Returns
Component instance with render function

### Component Definition

```javascript
export const App = defineComponent({
    data() {
        return {
            notes: [],
            loading: true
        };
    },
    render(h) {
        const notes = this.notes || [];
        const loading = this.loading;
        
        return h('div', { class: 'max-w-3xl mx-auto p-8 min-h-screen' },
            loading
                ? h('div', {}, 'Fetching your notes...')
                : [
                    h('header', {},
                        h('h1', {}, 'Laravel VDOM Notes'),
                        h('span', {}, `${notes.length} Notes`),
                        h('button', {
                            onClick: () => setState({ route: '/create' })
                        }, 'Create Note')
                    ),
                    h('ul', {},
                        ...(notes.length
                            ? notes.map(note => h(NoteItem, note))
                            : [h('div', {}, 'No notes found.')])
                    )
                ]
        );
    }
});
```

### When It's Called
```
Router() → state.route === '/' → App() → component instance
```

---

## 13. `AddForm()`

**File:** [resources/js/components/AddForm.js](resources/js/components/AddForm.js)

### What It Does
Form component for creating new notes with reactive two-way binding.

### Component Definition

```javascript
export const AddForm = defineComponent({
    data() {
        return {
            title: '',
            note: ''
        };
    },
    methods: {
        async handleSubmit(e) {
            e.preventDefault();
            await createNote({
                title: this.title,
                note: this.note,
                user_id: 2
            });
            this.title = '';
            this.note = '';
        },
        updateTitle(e) {
            this.title = e.target.value;
            setState({ title: e.target.value });
        },
        updateNote(e) {
            this.note = e.target.value;
            setState({ note: e.target.value });
        }
    },
    render(h) {
        return h('form', {
            onSubmit: this.handleSubmit
        },
            h('input', {
                value: this.title || '',
                onInput: this.updateTitle
            }),
            h('textarea', {
                value: this.note || '',
                onInput: this.updateNote
            }),
            h('button', { type: 'submit' }, 'Add Note')
        );
    }
});
```

### Key Features
- **Reactive Data** - `this.title` and `this.note` are reactive
- **Two-Way Binding** - Input changes update component data
- **Methods** - `handleSubmit`, `updateTitle`, `updateNote` bound to component

---

## 14. `NoteItem(props)`

**File:** [resources/js/components/NoteItem.js](resources/js/components/NoteItem.js)

### What It Does
Reusable component to display a single note. Accepts props.

### Component Definition

```javascript
export const NoteItem = defineComponent({
    props: {
        title: String,
        note: String
    },
    render(h) {
        return h('li', { class: 'p-4 mb-4 bg-white shadow rounded' },
            h('h2', {}, this.title),
            h('p', {}, this.note)
        );
    }
});
```

### Key Features
- **Props** - Receives `title` and `note` as props
- **Access via `this`** - Props available as `this.title` and `this.note`

---

# 🔄 STATE MANAGEMENT FUNCTIONS

## 15. `setState(partialState)`

**File:** [resources/js/state/store.js](resources/js/state/store.js)

### What It Does
Updates global reactive state and triggers effects.

### Parameters
- `partialState` - Object with properties to update

### Code

```javascript
export function setState(partialState) {
    Object.assign(state, partialState);
    Listeners.forEach(fn => fn());
}
```

### How It Works
1. Merges new state with existing state
2. Since `state` is reactive, property changes trigger effects
3. Also calls listeners for compatibility

---

## 16. `subscribe(fn)`

**File:** [resources/js/state/store.js](resources/js/state/store.js)

### What It Does
Register a function to be called whenever state changes (legacy pattern, now using reactive effects).

### Parameters
- `fn` - Callback function

---

# 🌐 API FUNCTIONS

## 17. `fetchNotes()`

**File:** [resources/js/api/notes.js](resources/js/api/notes.js)

### What It Does
Fetches all notes from the server and updates reactive state.

### How It Works
```javascript
export async function fetchNotes() {
    setState({ loading: true });
    
    try {
        const res = await axios.get('/api/notes');
        setState({
            notes: res.data,
            loading: false
        });
    } catch (err) {
        setState({ loading: false });
    }
}
```

---

## 18. `createNote(noteData)`

**File:** [resources/js/api/notes.js](resources/js/api/notes.js)

### What It Does
Sends new note to server, then refreshes notes list.

### Parameters
- `noteData` - Object with `title`, `note`, `user_id`

---

# 🧭 ROUTING FUNCTION

## 19. `Router()`

**File:** [resources/js/router/router.js](resources/js/router/router.js)

### What It Does
Returns appropriate component instance based on current route.

### Code

```javascript
export function Router() {
    switch (state.route) {
        case '/create':
            return AddForm();
        default:
            return App();
    }
}
```

### Returns
Component instance (not vnode, but component with render method)

---

# 🚀 MAIN APP SETUP

## 20. `updateUI()`

**File:** [resources/js/app.js](resources/js/app.js)

### What It Does
Main orchestrator. Called whenever reactive state changes. Gets component instance, syncs data, renders, and updates DOM.

### Code

```javascript
function updateUI() {
    const root = document.getElementById('app');
    
    // Get component instance from router
    const componentInstance = Router();
    
    // Update component data from global state
    if (componentInstance.data) {
        Object.keys(state).forEach(key => {
            if (componentInstance.data.hasOwnProperty(key)) {
                componentInstance.data[key] = state[key];
            }
        });
    }
    
    // Render the component
    const newVDom = componentInstance.render();
    
    if (!currentVDom) {
        root.innerHTML = '';
        root.appendChild(render(newVDom));
    } else {
        updateElement(root, newVDom, currentVDom);
    }
    
    currentVDom = newVDom;
}
```

### Flow
1. Get component instance from Router
2. Sync component data with global state
3. Render component to get vnode
4. Update DOM (first time: render, subsequent: diff)

---

## 21. `init()`

**File:** [resources/js/app.js](resources/js/app.js)

### What It Does
Sets up reactive effect to watch state changes and fetches initial data.

### Code

```javascript
async function init() {
    // Use reactive effect to watch for state changes
    effect(() => {
        // Access state properties to create dependencies
        const _ = state.notes;
        const __ = state.loading;
        const ___ = state.route;
        const ____ = state.title;
        const _____ = state.note;
        updateUI();
    });
    
    await fetchNotes();
}
```

### How It Works
1. Sets up `effect()` that watches all state properties
2. When any state property changes, `updateUI()` is called automatically
3. Fetches initial notes from server

---

# 📊 COMPLETE CALL FLOW EXAMPLES

## Example 1: Page Load

```
1. index.html loads app.js
2. DOMContentLoaded fires → init() called
3. init() → effect(() => { updateUI() })
4. effect() runs → accesses state.notes, state.loading, etc.
5. Dependencies tracked on state properties
6. init() → fetchNotes()
7. fetchNotes() → setState({ notes: [...], loading: false })
8. setState() → state.notes changed → effect triggers
9. updateUI() called
10. updateUI() → Router() → App()
11. App() returns component instance
12. updateUI() → componentInstance.render()
13. render() → h('div', {}, ...) → vnode
14. updateUI() → render(vnode) → DOM elements
15. Browser displays notes
```

## Example 2: User Types in Input

```
1. User types in AddForm input
2. onInput handler fires → updateTitle(e)
3. updateTitle() → this.title = e.target.value
4. this.title is reactive → triggers component effect
5. Component re-renders with new title value
6. updateUI() called (via global state effect)
7. updateUI() → AddForm() → componentInstance.render()
8. render() → h('input', { value: this.title })
9. updateElement() updates input.value in DOM
10. User sees typed character
```

## Example 3: Component Data Change

```
1. Component method changes this.notes.push('New')
2. this.notes is reactive → triggers component effect
3. Component re-renders
4. updateUI() called
5. New vnode created with updated notes
6. updateElement() efficiently updates DOM
7. New note appears in list
```

---

# 🔑 Key Concepts Summary

| Function | Purpose | Called By | Calls |
|----------|---------|-----------|-------|
| `reactive()` | Make object reactive | defineComponent(), store.js | Proxy constructor |
| `effect()` | Track dependencies | init(), defineComponent() | Function passed to it |
| `ref()` | Create reactive ref | (optional) | reactive() |
| `defineComponent()` | Define Vue component | Component definitions | reactive(), effect() |
| `h()` | Create vnode | Component render() | (none) |
| `render()` | Convert vnode to DOM | updateUI(), updateElement() | document APIs |
| `updateElement()` | Efficient DOM update | updateUI() | render(), updateElement() |
| `App()` | Main component | Router() | h() |
| `AddForm()` | Form component | Router() | h() |
| `NoteItem()` | Note component | App() | h() |
| `setState()` | Update global state | Event handlers, API | Object.assign() |
| `Router()` | Select component | updateUI() | App() or AddForm() |
| `updateUI()` | Main orchestrator | effect() | Router(), render(), updateElement() |
| `init()` | App startup | DOMContentLoaded | effect(), fetchNotes() |

---

This provides a complete reference for understanding how every function works in the Vue-style framework!
