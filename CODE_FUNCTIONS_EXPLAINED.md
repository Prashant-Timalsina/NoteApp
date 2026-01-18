# Code Functions Explained - Complete Reference

## Overview
This document explains **what each function does**, **how it works**, and **when it's called** in the VDOM framework.

---

## 📂 File Structure

```
resources/js/
├── app.js                    (Main entry point)
├── bootstrap.js              (Framework setup)
├── state/
│   └── store.js             (State management)
├── vdom/
│   ├── createElement.js     (Create VDOM objects)
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

# 🔥 CORE VDOM FUNCTIONS

## 1. `createElement(type, props, ...children)`

**File:** [resources/js/vdom/createElement.js](resources/js/vdom/createElement.js)

### What It Does
Creates a virtual representation of an HTML element (not real HTML, just a JavaScript object).

### Parameters
- `type` (string) - HTML tag name like `'div'`, `'button'`, `'form'`
- `props` (object) - Properties like `class`, `id`, event handlers
- `...children` (rest) - Child elements (can be elements, text, or arrays)

### Returns
An object representing the element structure:
```javascript
{
    type: 'button',
    props: { class: 'btn' },
    children: ['Click me']
}
```

### Example Usage
```javascript
// Simple button
createElement('button', { class: 'btn' }, 'Click')

// Form with multiple children
createElement('form', { onSubmit: handleSubmit },
    createElement('input', { placeholder: 'Title' }),
    createElement('textarea', { placeholder: 'Content' }),
    createElement('button', {}, 'Submit')
)

// Nested structure
createElement('div', { class: 'card' },
    createElement('h2', {}, 'Title'),
    createElement('p', {}, 'Description')
)
```

### Why It's Needed
- **Blueprint** - Describes what HTML should look like without creating it
- **Data Structure** - Allows comparison (old vs new)
- **Reusability** - Can be stored, passed around, compared

### Call Chain
```
app.js → Router() → AddForm() → createElement() → vnode object
                  → App() → createElement() → vnode object
```

---

## 2. `render(vNode)`

**File:** [resources/js/vdom/render.js](resources/js/vdom/render.js)

### What It Does
Converts a virtual DOM object into real HTML that browsers can display.

### Parameters
- `vNode` - Virtual node (object from `createElement()`) or text

### Returns
Real DOM element: `<button class="btn">Click me</button>`

### Step-by-Step Process

```javascript
export function render(vNode) {
    // Step 1: Handle null/undefined
    if (!vNode) return document.createTextNode('');
    
    // Step 2: Handle text/numbers
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(String(vNode));
    }

    // Step 3: Create the actual HTML element
    const $el = document.createElement(vNode.type);

    // Step 4: Set properties (class, id, value, events)
    for (const [key, value] of Object.entries(vNode.props || {})) {
        if (key.startsWith('on')) {
            // Event handler: onClick → addEventListener('click', ...)
            const eventName = key.toLowerCase().substring(2);
            $el.addEventListener(eventName, value);
        } else if (key === 'class') {
            $el.className = value;
        } else if (key === 'value') {
            $el.value = value;  // For inputs/textareas
        } else {
            $el.setAttribute(key, String(value));
        }
    }

    // Step 5: Recursively render all children
    (vNode.children || []).forEach(child => {
        if (child !== null && child !== undefined) {
            $el.appendChild(render(child));  // Recursive!
        }
    });

    return $el;  // Return built HTML element
}
```

### Example Execution

**Input:**
```javascript
{
    type: 'button',
    props: { class: 'btn', onClick: handleClick },
    children: ['Click me']
}
```

**Process:**
1. Create `<button>` element
2. Set `class="btn"`
3. Attach click event handler
4. Add text "Click me" as child
5. Return `<button class="btn">Click me</button>`

### When It's Called
- First page load (in `app.js`'s `updateUI()`)
- When entire element is replaced (in `diff.js`)
- Recursively for all children

### Call Chain
```
app.js → updateUI() → render(newVDom) → real DOM elements
app.js → root.appendChild(renderedElement)
```

---

## 3. `changed(node1, node2)`

**File:** [resources/js/vdom/diff.js](resources/js/vdom/diff.js)

### What It Does
Checks if two virtual nodes represent different elements (type changed, or text content changed).

### Parameters
- `node1` - Old virtual node
- `node2` - New virtual node

### Returns
- `true` - Nodes are different, need to replace
- `false` - Nodes are same type, can update in place

### Logic
```javascript
export function changed(node1, node2) {
    // Different types (string vs object, button vs div)
    if (typeof node1 !== typeof node2) return true;
    
    // Both are strings but different text
    if (typeof node1 === 'string' && node1 !== node2) return true;
    
    // Different element types (div vs button)
    if (node1.type !== node2.type) return true;
    
    // Otherwise, same type - can update without replacement
    return false;
}
```

### Examples

```javascript
// ❌ Changed - string vs element
changed('Hello', { type: 'button' })  // true

// ❌ Changed - different text
changed('Hello', 'Goodbye')  // true

// ❌ Changed - different element types
changed({ type: 'div' }, { type: 'button' })  // true

// ✅ Not changed - same element type (can update props)
changed({ type: 'button' }, { type: 'button' })  // false
```

### Why It's Needed
- **Performance** - Don't rebuild entire element if only props changed
- **Decision Point** - If changed → rebuild, else → update

---

## 4. `updateElement($parent, newVNode, oldVNode, index)`

**File:** [resources/js/vdom/diff.js](resources/js/vdom/diff.js)

### What It Does
The heart of the VDOM diffing algorithm. Efficiently updates the DOM by comparing old and new virtual DOM and applying only necessary changes.

### Parameters
- `$parent` - Parent DOM element to update
- `newVNode` - New virtual DOM structure
- `oldVNode` - Old virtual DOM structure
- `index` - Position of element in parent's children

### Returns
Nothing (modifies DOM directly)

### Step-by-Step Logic

```javascript
export function updateElement($parent, newVNode, oldVNode, index = 0) {
    
    // Case 1: New element (no old version)
    if (!oldVNode) {
        $parent.appendChild(render(newVNode));
        return;
    }
    
    // Case 2: Element removed
    if (!newVNode) {
        if ($parent.childNodes[index]) {
            $parent.removeChild($parent.childNodes[index]);
        }
        return;
    }
    
    // Case 3: Element type changed (button → div)
    if (changed(newVNode, oldVNode)) {
        $parent.replaceChild(render(newVNode), $parent.childNodes[index]);
        return;
    }
    
    // Case 4: Same type - update properties in place
    if (newVNode.type) {
        const $el = $parent.childNodes[index];

        // Update all properties
        const props = { ...oldVNode.props, ...newVNode.props };
        Object.keys(props).forEach(name => {
            if (newVNode.props[name] !== oldVNode.props[name]) {
                
                // Update value (for inputs)
                if (name === 'value') {
                    $el.value = newVNode.props[name];
                }
                
                // Update event handlers
                else if (name.startsWith('on')) {
                    const eventName = name.toLowerCase().substring(2);
                    if (oldVNode.props[name]) {
                        $el.removeEventListener(eventName, oldVNode.props[name]);
                    }
                    $el.addEventListener(eventName, newVNode.props[name]);
                }
                
                // Update other attributes
                else {
                    $el.setAttribute(name, newVNode.props[name]);
                }
            }
        });

        // Recursively update all children
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
```

### Example Scenarios

**Scenario 1: New Note Added**
```javascript
// Old VDOM: 2 notes
// New VDOM: 3 notes (new note at end)

updateElement(
    $listParent,
    newNoteItem,    // New 3rd note
    undefined,      // No old 3rd note
    2               // At index 2
)
// Result: appendChild(render(newNoteItem))
```

**Scenario 2: Note Deleted**
```javascript
updateElement(
    $listParent,
    undefined,      // Note no longer exists
    oldNoteItem,    // Was here before
    0               // Was at index 0
)
// Result: removeChild($parent.childNodes[0])
```

**Scenario 3: Input Value Changed**
```javascript
// Old: <input value="Hello" />
// New: <input value="Hello World" />

updateElement($form, newInputVNode, oldInputVNode, 0)
// Result: Only update input.value, don't rebuild element
```

### Why It's Needed
- **Performance** - Only change what's different
- **Preserve State** - Keeps input focus, scroll position, etc.
- **Efficient Updates** - Can update thousands of elements in milliseconds

---

# 🎨 COMPONENT FUNCTIONS

## 5. `App(state)`

**File:** [resources/js/components/App.js](resources/js/components/App.js)

### What It Does
Main app component. Displays either a loading message or list of notes.

### Parameters
- `state` - Current app state (notes, loading status)

### Returns
Virtual DOM representing the app

### What It Renders
```
┌─────────────────────────────────┐
│ Loading state (if loading)       │
│ OR                              │
│ Header with note count          │
│ List of notes                   │
│ Create button                   │
└─────────────────────────────────┘
```

### Code Breakdown
```javascript
export function App(state) {
    return createElement(
        'div',
        { class: 'max-w-3xl mx-auto p-8' },
        
        // If loading, show spinner
        state.loading
            ? createElement('div', {}, 'Loading...')
            
            // Otherwise show content
            : [
                // Header section
                createElement(
                    'header',
                    {},
                    createElement('h1', {}, 'Notes App'),
                    createElement('span', {}, `${state.notes.length} Notes`),
                    createElement('button', { onClick: () => setState({ route: '/create' }) }, 'Create')
                ),
                
                // Notes list
                createElement(
                    'ul',
                    {},
                    ...state.notes.map(note => NoteItem(note))
                )
            ]
    );
}
```

### When It's Called
```
Router() → state.route === '/' → App(state) → vnode
```

---

## 6. `AddForm()`

**File:** [resources/js/components/AddForm.js](resources/js/components/AddForm.js)

### What It Does
Form component for creating new notes. Contains input fields and submission handler.

### Returns
Virtual DOM of a form with inputs

### What It Renders
```
┌──────────────────────────┐
│ [Title Input]            │
│ [Note Textarea]          │
│ [Add Note Button]        │
└──────────────────────────┘
```

### Code Breakdown
```javascript
export function AddForm() {
    return createElement('form', {
        onSubmit: async (e) => {
            e.preventDefault();  // Prevent page refresh
            
            // Send note to server
            await createNote({
                title: state.title,
                note: state.note,
                user_id: 2
            });
            
            // Clear form
            setState({ title: '', note: '' });
        }
    },
        // Title input - controlled by state
        createElement('input', {
            value: state.title,
            placeholder: 'Title',
            onInput: e => setState({ title: e.target.value })
        }),

        // Note textarea - controlled by state
        createElement('textarea', {
            value: state.note,
            placeholder: 'Note',
            onInput: e => setState({ note: e.target.value })
        }),

        // Submit button
        createElement('button', {
            type: 'submit'
        }, 'Add Note')
    );
}
```

### Key Features
- **Controlled Inputs** - Values come from state
- **Live Updates** - onInput updates state in real-time
- **Form Submission** - onSubmit sends to server
- **State Management** - Clears form after submission

### When It's Called
```
Router() → state.route === '/create' → AddForm() → vnode
```

---

## 7. `NoteItem(note)`

**File:** [resources/js/components/NoteItem.js](resources/js/components/NoteItem.js)

### What It Does
Reusable component to display a single note.

### Parameters
- `note` - Note object with `title` and `note` properties

### Returns
Virtual DOM of a note item

### What It Renders
```
┌──────────────────────────┐
│ [Note Title]             │
│ [Note Content]           │
└──────────────────────────┘
```

### Code
```javascript
export function NoteItem({ title, note }) {
    return createElement(
        'li',
        { class: 'p-4 mb-4 bg-white shadow rounded' },
        createElement('h2', { class: 'text-xl font-bold' }, title),
        createElement('p', { class: 'mt-2 text-gray-600' }, note)
    );
}
```

### When It's Called
```
App() → state.notes.map(note => NoteItem(note))
→ Array of vnodes displayed as list
```

---

# 🔄 STATE MANAGEMENT FUNCTIONS

## 8. `setState(partialState)`

**File:** [resources/js/state/store.js](resources/js/state/store.js)

### What It Does
Updates global app state and notifies all subscribers of the change.

### Parameters
- `partialState` - Object with properties to update (e.g., `{ title: 'New' }`)

### How It Works
```javascript
export function setState(partialState) {
    // Merge new state with existing state
    Object.assign(state, partialState);
    
    // Notify all subscribers
    Listeners.forEach(fn => fn());
}
```

### Example Usage
```javascript
// Update single property
setState({ title: 'My Note' })
// state is now: { title: 'My Note', note: '', route: '/' }

// Update multiple properties
setState({ title: 'Title', note: 'Content', route: '/' })

// Trigger UI update
setState({ notes: newNotes })  // All listeners called → UI re-renders
```

### Flow
```
User types in input
→ onInput: e => setState({ title: e.target.value })
→ state.title updated
→ Listeners notified
→ updateUI() called
→ App re-renders with new title
```

### Why It's Important
- **Single Source of Truth** - All state in one place
- **Reactive** - Notifies UI when state changes
- **Predictable** - Changes always go through setState

---

## 9. `subscribe(fn)`

**File:** [resources/js/state/store.js](resources/js/state/store.js)

### What It Does
Register a function to be called whenever state changes.

### Parameters
- `fn` - Callback function to call on state change

### How It Works
```javascript
export function subscribe(fn) {
    Listeners.push(fn);  // Add to listeners array
}
```

### Usage
```javascript
// In app.js
subscribe(updateUI);  // When state changes, call updateUI()
```

### Flow
```
subscribe(updateUI)
→ Listeners = [updateUI]

setState({ notes: [...] })
→ Listeners.forEach(fn => fn())
→ updateUI() called
→ New VDOM created
→ DOM updated with new notes
```

### Why It's Important
- **Observer Pattern** - Decouples state from UI
- **Scalability** - Can subscribe multiple times
- **Reactivity** - UI automatically updates on state change

---

# 🌐 API COMMUNICATION FUNCTIONS

## 10. `fetchNotes()`

**File:** [resources/js/api/notes.js](resources/js/api/notes.js)

### What It Does
Fetches all notes from the server and updates app state.

### Parameters
None

### Returns
Promise (used with await)

### Code
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
        console.error('Fetch failed', err);
        setState({ loading: false });
    }
}
```

### Step-by-Step
1. Set `loading: true` → UI shows spinner
2. Send GET request to `/api/notes` → Server returns notes array
3. Update state with notes → UI re-renders
4. If error → Log error, hide spinner

### When It's Called
- App startup (in `app.js`'s `init()`)
- After creating a note (in `createNote()`)

### API Endpoint
```
GET /api/notes
Returns: [{ id: 1, title: '...', note: '...' }, ...]
```

---

## 11. `createNote(noteData)`

**File:** [resources/js/api/notes.js](resources/js/api/notes.js)

### What It Does
Sends new note to server, then refreshes notes list.

### Parameters
- `noteData` - Object with `title`, `note`, `user_id`

### Returns
Promise (used with await)

### Code
```javascript
export async function createNote(noteData) {
    try {
        await axios.post('/api/notes', noteData);

        // Refetch all notes from server
        await fetchNotes();
        
        // Navigate to home
        setState({ route: '/' });
    } catch (err) {
        if (err.response && err.response.status === 422) {
            console.error('Validation Errors:', err.response.data.errors);
        } else {
            console.error('Create failed', err);
        }
    }
}
```

### Step-by-Step
1. Send POST request with note data
2. If success → Refetch all notes (ensures fresh data)
3. Navigate to home page
4. If validation error → Log validation errors
5. If other error → Log error

### When It's Called
- User submits form in AddForm

### API Endpoint
```
POST /api/notes
Body: { title: '...', note: '...', user_id: 2 }
Returns: { id: 1, title: '...', note: '...' }
```

### Why Refetch After Creation
- **Data Consistency** - Server generates ID, timestamps, etc.
- **Validation** - Server might modify data
- **Multi-user** - Other users might have added notes

---

# 🧭 ROUTING FUNCTION

## 12. `Router()`

**File:** [resources/js/router/router.js](resources/js/router/router.js)

### What It Does
Determines which component to show based on current route.

### Parameters
None (reads from global `state.route`)

### Returns
Virtual DOM of appropriate component

### Code
```javascript
export function Router() {
    switch (state.route) {
        case '/create':
            return AddForm();
        default:
            return App(state);
    }
}
```

### Routes
- `/` (default) - Show all notes (App component)
- `/create` - Show form to create note (AddForm component)

### Usage in App
```javascript
// In app.js
const newVDom = Router();  // Get component based on current route
```

### Navigation Example
```javascript
// User clicks "Create Note" button
onClick: () => setState({ route: '/create' })

// setState triggers listeners
// updateUI() called
// Router() now returns AddForm()
// UI shows form
```

---

# 🚀 MAIN APP SETUP

## 13. `updateUI()`

**File:** [resources/js/app.js](resources/js/app.js)

### What It Does
The main orchestrator. Called whenever state changes. Regenerates VDOM and updates DOM.

### Code
```javascript
function updateUI() {
    const root = document.getElementById('app');
    const newVDom = Router();  // Get new virtual DOM

    if (!currentVDom) {
        // First time: render from scratch
        root.innerHTML = '';
        root.appendChild(render(newVDom));
    } else {
        // Subsequent times: efficiently update
        updateElement(root, newVDom, currentVDom);
    }

    currentVDom = newVDom;  // Remember for next update
}
```

### Step-by-Step
1. Get root DOM element (div#app)
2. Generate new VDOM using Router()
3. If first time → Render entire tree
4. If updates → Use diff algorithm to update only changes
5. Remember new VDOM for next time

### Call Flow
```
Any state change
→ setState() called
→ Listeners notified
→ updateUI() called
→ Router() returns component
→ updateElement() applies changes
→ Browser displays update
```

---

## 14. `init()`

**File:** [resources/js/app.js](resources/js/app.js)

### What It Does
Called when page loads. Sets up the app.

### Code
```javascript
async function init() {
    subscribe(updateUI);      // When state changes, update UI
    await fetchNotes();       // Load notes from server
}
```

### Step-by-Step
1. Subscribe updateUI to state changes
2. Fetch initial notes from server
3. When fetchNotes updates state → updateUI called → UI rendered

### When It's Called
```javascript
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
// Waits for page to load, then calls init
```

---

# 📊 COMPLETE CALL FLOW EXAMPLES

## Example 1: Page Load

```
1. index.html loads app.js
2. app.js waits for DOMContentLoaded
3. DOMContentLoaded fires → init() called
4. init() → subscribe(updateUI)
5. init() → fetchNotes()
6. fetchNotes() → axios.get('/api/notes')
7. Server responds with notes
8. fetchNotes() → setState({ notes: [...], loading: false })
9. setState() → Listeners.forEach(fn => fn())
10. updateUI() called
11. updateUI() → Router() → App(state)
12. App() → createElement('div', {}, ...)
13. updateUI() → render(newVDom)
14. render() → document.createElement() for each element
15. render() → appendChild() for children
16. Browser displays notes list
```

## Example 2: User Adds Note

```
1. User types in AddForm textarea
2. onInput handler fires
3. e => setState({ note: 'typed text' })
4. setState() updates state.note
5. setState() calls Listeners
6. updateUI() called
7. updateUI() → Router() → AddForm()
8. AddForm() → createElement() with new state.note
9. updateUI() → updateElement() compares old/new
10. updateElement() updates textarea value in DOM
11. User clicks "Add Note" button
12. onSubmit handler fires
13. onSubmit → createNote({ title, note, user_id })
14. createNote() → axios.post('/api/notes', data)
15. Server creates note, responds with new note
16. createNote() → fetchNotes()
17. fetchNotes() → axios.get('/api/notes')
18. Server returns updated notes list (including new)
19. fetchNotes() → setState({ notes: [...], loading: false })
20. setState() calls Listeners
21. updateUI() called
22. updateUI() → Router() → App(state)
23. App() renders new notes list with new note
24. Browser displays all notes including new one
```

## Example 3: Navigate to Create Form

```
1. User clicks "Create Note" button
2. onClick handler fires
3. onClick: () => setState({ route: '/create' })
4. setState() updates state.route
5. setState() calls Listeners
6. updateUI() called
7. updateUI() → Router()
8. Router() checks state.route
9. state.route === '/create' → return AddForm()
10. AddForm() → createElement() with form
11. updateUI() → updateElement()
12. updateElement() replaces App component with AddForm
13. Browser displays form
```

---

# 🎯 Function Call Dependency Graph

```
Document Load
    ↓
init()
    ├── subscribe(updateUI)
    └── fetchNotes()
        └── setState({ notes, loading })
            └── Listeners.forEach(fn => fn())
                └── updateUI()
                    └── Router()
                        └── App(state) or AddForm()
                            └── createElement()
                                └── render() [first time]
                                    └── document.createElement()
                                    └── appendChild()

User Interaction
    ↓
Event Handler (onClick, onInput, onSubmit)
    ↓
setState()
    ↓
Listeners.forEach(fn => fn())
    ↓
updateUI()
    ├── Router()
    ├── updateElement() [subsequent times]
    │   ├── changed() - decide if replace or update
    │   ├── appendChild() - new elements
    │   ├── removeChild() - deleted elements
    │   └── setAttribute() - updated properties
    └── currentVDom = newVDom
```

---

# 🔑 Key Concepts Summary

| Function | Purpose | Called By | Calls |
|----------|---------|-----------|-------|
| `createElement()` | Create vnode object | Components | (none) |
| `render()` | Convert vnode to HTML | updateUI(), updateElement() | document APIs |
| `changed()` | Compare vnodes | updateElement() | (none) |
| `updateElement()` | Efficient DOM update | updateUI(), updateElement() (recursive) | render(), updateElement(), DOM APIs |
| `App()` | Main view component | Router() | createElement(), NoteItem() |
| `AddForm()` | Form component | Router() | createElement() |
| `NoteItem()` | Note display component | App() | createElement() |
| `setState()` | Update global state | Event handlers, API functions | Object.assign(), Listeners callbacks |
| `subscribe()` | Register state listener | init() | Array.push() |
| `fetchNotes()` | Get notes from server | init(), createNote() | axios, setState() |
| `createNote()` | Post note to server | AddForm.onSubmit | axios, fetchNotes(), setState() |
| `Router()` | Select component by route | updateUI() | App() or AddForm() |
| `updateUI()` | Main orchestrator | subscribe(), direct calls | Router(), render(), updateElement() |
| `init()` | App startup | DOMContentLoaded event | subscribe(), fetchNotes() |

---

# 💡 Execution Timeline

### Initial Load
```
Time 0:   index.html loaded
Time 100: app.js executed
Time 150: DOMContentLoaded fires
Time 151: init() called
Time 152: subscribe(updateUI) - register listener
Time 153: fetchNotes() - start API call
Time 300: API responds with notes
Time 301: setState({ notes: [...], loading: false })
Time 302: updateUI() called
Time 303: App vnode created
Time 304: render() creates real elements
Time 305: Browser displays notes
```

### User Action (Type in Input)
```
Time 500: User types character
Time 501: onInput handler fires
Time 502: setState({ note: 'a' })
Time 503: updateUI() called
Time 504: AddForm vnode created with new note value
Time 505: updateElement() updates textarea.value in DOM
Time 510: User sees character in input
```

### User Action (Submit Form)
```
Time 1000: User clicks Submit
Time 1001: onSubmit handler fires
Time 1002: createNote() called with data
Time 1003: axios.post() starts
Time 1050: Server responds with created note
Time 1051: fetchNotes() called
Time 1052: axios.get() starts
Time 1100: Server responds with notes list
Time 1101: setState({ notes: [...new list...], loading: false })
Time 1102: updateUI() called
Time 1103: App vnode created with new notes
Time 1104: updateElement() updates DOM
Time 1105: Browser displays all notes including new one
```

This provides a complete reference for understanding how every function works and when it's called!
