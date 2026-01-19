# Authentication & Notes Architecture

## Separation of Concerns

### State Management (3 separate stores)

1. **userStore.js** - User authentication state
   - `user` - Logged-in user data { id, email, name }
   - `isAuthenticated` - Boolean flag
   - `authLoading` - Loading state during auth operations
   - `authError` - Error messages

2. **notesStore.js** - Note data management
   - `notes` - Array of user's notes
   - `notesLoading` - Loading state for note operations
   - `notesError` - Error messages
   - `title`, `note` - Form input state
   - `noteId` - Currently viewing note ID

3. **uiStore.js** - UI/routing state
   - `route` - Current route ('/', '/create', '/view', '/login', '/register')
   - `loading` - General loading state

### API Functions (2 modules)

1. **api/auth.js** - Authentication
   - `login(email, password)` - Login user
   - `register(email, password, name)` - Register new user
   - `logout()` - Logout user
   - `checkAuth()` - Verify saved token on app load

2. **api/notes.js** - Note operations
   - `fetchNotes()` - Get all user notes
   - `createNote(noteData)` - Create new note
   - `fetchNote(noteId)` - Get single note

### Components Structure

```
App Entry
├── Login & Register (Authentication routes)
├── App (Protected - shows only when authenticated)
│   ├── Header (with logout button & user name)
│   ├── ViewAllNotes
│   │   └── NoteItem(s)
│   ├── AddForm (Create note)
│   └── ViewNote (View single note)
```

## Session Management

1. **Token Storage**: JWT token stored in `localStorage`
2. **Auto-login**: `checkAuth()` called on app load checks saved token
3. **Protected Routes**: Router checks `userState.isAuthenticated`
4. **Logout**: Clears token from localStorage & resets state

## Data Flow

### Login Flow
```
LoginForm → login(email, password) → API call
  → userState.user = response.user
  → localStorage.authToken = response.token
  → Router shows App component
```

### Create Note Flow
```
AddForm → createNote() → API call
  → fetchNotes() refreshes list
  → notesState.notes updated
  → UpdateUI triggers re-render
```

### App Load Flow
```
init() → checkAuth()
  → Token valid? Load notes & show App
  → No token? Show Login screen
```

## Benefits

✅ **Clear Separation**: User concerns separate from note concerns  
✅ **Scalable**: Easy to add more features (tags, sharing, etc.)  
✅ **Session Persistence**: Users stay logged in after refresh  
✅ **Protected Routes**: Only authenticated users see app  
✅ **Modular**: Each store/API module has single responsibility  

## Next Steps (Optional)

- Add delete note functionality
- Add edit note functionality
- Add tags/categories
- Add note sharing between users
- Add search/filter
