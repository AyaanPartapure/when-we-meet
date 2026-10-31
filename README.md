# When We Meet

*A private, local-first journaling web app for thoughts that are better said in person.*

![When We Meet Web App Screenshot](./assets/webapp-home.png)

## Story Behind the Project

Sometimes a thought comes to mind — a story, a question, a feeling, or something important you want to tell someone.

But not everything feels right to send as a message.

Some conversations feel more meaningful in person. The problem is that when we finally meet that person, we often forget what we wanted to say.

That is the idea behind **When We Meet**.

I built this project as a simple and personal web app where thoughts can be saved quietly, organized by person and topic, and opened again later when the right moment comes.

It is not a chat app. It is not social media. It is not a heavy productivity platform.

It is a calm personal space for real conversations.

---

## Why This Project Is Important

This project solves a small but very real daily problem:

- we think of something important
- we do not want to message it immediately
- we forget it later

**When We Meet** helps by giving every person their own private space where thoughts can be saved neatly and meaningfully.

This makes the app useful for:

- remembering things to say later
- saving questions for someone important
- preparing for meaningful conversations
- storing little stories or updates for the right moment
- reducing dependence on chat for every small thought
- encouraging more intentional face-to-face communication

In one line:

> **Keep the thought now. Say it when you meet.**

---

## Features

- **Private and local-first**
- **Clean UI** with a soft and simple design
- **Person-based organization** so each person gets their own space
- **Topic branches** for grouping related thoughts
- **Quick thought capture**
- **Meet Mode** to review thoughts one by one
- **Search and filters**
- **Star important thoughts**
- **Backup and restore support**
- **Optional folder sync** for readable and backup files

---

## Clean UI / UX

The design of **When We Meet** is intentionally clean, light, and quiet.

The goal is to make the experience feel personal and easy to use, not cluttered or stressful. The UI is designed so the user can focus on the thought itself.

The basic experience is simple:

1. create a person
2. add thoughts for that person
3. organize them into branches or topics
4. open them later when meeting that person

That simplicity is what makes the project useful.

---

## How Data Is Saved

This project does **not** use a complex backend or an external online database.

It uses **IndexedDB**, which is a built-in browser database.

That means:

- no Node.js is needed for local use
- no Python is needed for local use
- no server setup is needed
- no online database is needed
- no internet is required after opening the app
- your journal data stays on your own device

### Extra files

If the user links a folder in Chrome or Edge, the app can also create:

- `journal.txt` → a readable text copy of the journal
- `journal-backup.json` → a full backup that can be restored later

These are extra copies.

The main working data is still stored locally in the browser using IndexedDB.

---

## Tech Stack

- **HTML**
- **CSS**
- **Vanilla JavaScript**
- **IndexedDB**

This keeps the project lightweight, simple, and easy to run.

---

## How to Run

1. Download or clone the repository.
2. Open the project folder.
3. Double-click `index.html`.
4. Open it in **Chrome** or **Edge**.
5. Start creating people, branches, and thoughts.

No installation is required for local use.

---

## Privacy Note

This is a **private journaling app**.

If this project is uploaded to a public GitHub repository, personal journal files should **not** be uploaded.

Do not upload files such as:

- `journal.txt`
- `journal-backup.json`

These may contain private thoughts.

That is why they should be listed in `.gitignore`.

---

## Best Use Cases

**When We Meet** is useful for people who:

- prefer speaking in person
- want to remember what they want to say later
- like keeping thoughts organized by person
- want a private journal without complicated setup
- want a clean and sweet web experience

---

## Final Note

This project was built from a simple human idea:

> Some things are better said in person.

**When We Meet** gives those thoughts a safe place to wait.

