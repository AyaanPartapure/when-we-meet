# When We Meet — The Quiet Atlas

**A private place for the things you want to say in person.**

When We Meet is a calm, ice-blue conversation journal. No sign-in. No subscription. No complex backend. Just open the website in your browser and keep the thoughts you want to share when you next meet someone.

## The story

I prefer talking in person instead of sending everything through chat. Sometimes a small story, a question, or something important comes to mind when that person isn't around. And when we finally meet, I forget what I wanted to say.

I made **When We Meet** to solve that.

Each person gets their own space, with topics and subtopics for everything I want to say. Whenever we meet, I can open the notes one by one and focus on the conversation itself.

**Less typing. More talking. More room for what matters.**

## What is different in this edition?

- **The Quiet Atlas design** — an editorial, light-blue-and-white interface, not another dashboard with a left sidebar.
- **Conversation Atlas** — interactive connected topic branches, including nested subtopics.
- **Person spaces** — one calm home for each person.
- **Quick Capture** — add a thought from anywhere; `N` opens the composer.
- **Thought cards** — edit, search, star, discuss or reopen.
- **Timeline** — see how thoughts and discussions developed over time.
- **Meet Mode** — one thought at a time, starred thoughts first, with previous/next controls and Undo after marking discussed.
- **Backups** — JSON export/restore and optional folder-linked text copies.
- **Responsive design** — desktop, tablet and phone layouts.

## Start in 10 seconds

1. Extract the ZIP to a folder on your laptop.
2. Double-click **`index.html`** to open in Chrome or Edge.
3. Add a person, then add topics and thoughts.

No Python, Node.js, server or extra database installation is required. The site works offline after opening.

## Where is my data saved?

The working journal is stored in **IndexedDB**, a database already built into your browser. It stores people, topics, thoughts and discussion status locally on your device.

This is not a cloud database. Closing the tab normally will not erase your notes, but clearing browser site data, using another browser profile, moving the HTML file, or reinstalling the browser/Windows can make notes inaccessible or destroy them.

**Always keep a separate backup.**

Go to **Data → Download backup** to save the complete journal as JSON. You can bring it back with **Data → Restore backup**. Importing a backup replaces the current journal, so export the current data first.

### Optional: keep files inside a folder

On supported Chrome or Edge setups, use **Data → Link folder** and select the folder containing `index.html`. When folder permission is granted, the app can also maintain:

| File | Purpose |
| --- | --- |
| `journal.txt` | Human-readable copy of your saved thoughts. This is **not** the editable source of truth. |
| `journal-backup.json` | Complete JSON backup suitable for restoring the journal. |

Browser permission can expire. Use **Reconnect / sync** if the website cannot update the folder. Some browsers restrict folder access when a website is opened with a `file://` address. If the folder picker is unavailable, the one-click downloadable JSON backup still works.

## Upgrading from an earlier When We Meet version

**Do not assume that the new folder automatically shares the same browser storage as the previous folder.**

The data structure is compatible, but browser storage can be scoped to the local file's origin. To move your data safely:

1. Open your **old website** in the same browser where your thoughts appear.
2. Open its **Settings & Backups** page and **download a JSON backup**.
3. Keep the old folder unchanged.
4. Open the new `index.html`.
5. Choose **Data → Restore backup**, select the old JSON backup and confirm.
6. Check that your people, topics and thoughts appear correctly.
7. Optionally link the new folder to produce updated `journal.txt` and `journal-backup.json` copies.

Do **not** restore a blank backup over a journal that contains data you want to keep.

## Technology

- HTML5, CSS3 and vanilla JavaScript
- Browser IndexedDB for persistence
- Optional File System Access API for folder snapshots
- Zero dependencies, zero build step, no external network calls

## Project files

- `index.html` — website entry
- `style.css` — light-blue visual system and responsive layouts
- `app.js` — views, events, conversation atlas and Meet Mode
- `storage.js` — local data validation, IndexedDB CRUD and backup logic
- `favicon.svg` — site icon
- `README.md` — documentation
- `.gitignore` — prevents accidental Git commits of common journal backup filenames

## Safety when uploading to GitHub

Upload the source files above, **not personal journal files** such as `journal.txt`, `journal-backup.json`, or downloadable backups. Those may contain private conversations.

GitHub Pages can host the static website, but it does **not** provide accounts or cloud synchronization. Each visitor's browser maintains its own local journal.

---

*A place to keep what you want to say, until the moment you meet.*
