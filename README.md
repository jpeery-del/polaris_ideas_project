# Platonic Study

A study app for reading and studying the dialogues of Plato. Browse by tetralogy, read key passages, practice with flashcards, and keep notes.

## Features

- **Dialogues** — Dialogues grouped by Thrasyllan tetralogy (Euthyphro, Apology, Crito, Phaedo, Republic, Symposium, etc.) with short descriptions and key passages.
- **Flashcards** — Review concepts (Euthyphro dilemma, recollection, allegory of the cave, etc.) with flip cards.
- **Notes** — Add and edit notes in the browser (stored in `localStorage`).

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Customize

- **More passages** — Edit `src/data/dialogues.js`: add entries to the `passages` object and use the same dialogue `id` as in the tetralogy list.
- **More flashcards** — Add objects `{ front: "Question", back: "Answer" }` to the `flashcards` array in `src/data/dialogues.js`.
- **More dialogues** — Add dialogues to the `tetralogies` array; you can follow the same structure as the existing tetralogies.

Public-domain translations (e.g. Jowett) can be used for longer excerpts; see [Perseus](https://www.perseus.tufts.edu/hopper/collection?collection=Perseus%3Acorpus%3Aperseus%2Cauthor%2CPlato) and [Scaife Viewer](https://scaife.perseus.org/).
