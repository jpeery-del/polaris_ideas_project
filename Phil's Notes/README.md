# Phil's Notes

This document explains how to run the application and provides context on the project’s purpose, features, and development notes.

---

## How to Run the Application

### 1. Install and run the backend

```bash
cd server
npm install
npm run dev
```

The server runs at **http://localhost:3001**.

### 2. Install and run the frontend

From the **project root** (not inside `server`):

```bash
npm install
npm run dev
```

The frontend runs at **http://localhost:5173** and proxies `/api` requests to the backend.

### 3. Use the app

Open **http://localhost:5173** in your browser. Create an account or sign in, then use the book workspaces, themes, and essay planner.

### Production / build

- **Build frontend:** `npm run build` (from project root)
- **Preview built app:** `npm run preview`
- **Run production server:** From project root, `npm run start` (or `cd server && node index.js`). Set `JWT_SECRET` and optionally `PORT` in the environment.

---

## Expanded Problem–Solution Statement

**Problem:** Studying philosophic texts is difficult, and students waste hours with inefficient study methods. Traditional tools such as flashcards and Quizlet are insufficient for philosophic texts because you cannot reduce abstract and complex philosophical ideas into a simple term-and-definition flashcard. Additionally, when notes are scattered across various papers, organizing ideas is difficult and often incomplete. This often leads to studying for exams and essays by rereading the text, which is time-consuming and inconvenient.

**Solution:** The solution is a website that lets users organize their ideas into a structured framework. The site allows users to organize notes, ideas, questions, objections, quotes, and essay plans in a format that is hard to lose (unlike loose notes) and easy to organize. Because all notes are pre-formatted (quotes, analysis, arguments, etc.), users can refer directly to those sections. The essay planner helps students plan essays as an extra feature.

---

## Features

### Book workspace

Create a dedicated workspace for each philosophical text. Add books with full bibliographic details (author, translator, edition, year) and optional tags. Each book gives you structured tabs:

- **Overview** — Free-form notes by section (e.g. Book 1, Book 2). Use note types such as summary, key concepts, quotations, questions, and implications, with optional subentries so you can nest and organize as you go.
- **Summary** — Chapter-by-chapter summaries with page ranges, main theses, and rich-text content that auto-saves as you type.
- **Key arguments** — Capture arguments with claim, premises, conclusion, assumptions, strengths, and weaknesses. Link arguments to themes for cross-referencing.
- **Quotations** — Store important passages with text, page numbers, context, and why they matter. Tag and link quotations to themes.
- **Philosophical analysis** — Your own analysis in expandable sections with rich text.
- **Questions & objections** — Track questions and objections that arise from the text.
- **Cross-connections** — Connect the book to shared themes and see how it ties into your broader reading.

### Themes

Themes connect ideas across books. Create themes (e.g. justice, freedom, virtue), attach them to arguments and quotations in your book workspaces, then open any theme to see all linked books, quotations, and arguments in one place. Useful for papers and revision.

### Essays

Manage essay projects in one place. Add essays with title, prompt, course, and due date. Each essay gets its own workspace with **Prompt Analysis**, **Thesis Builder**, **Outline**, and a full writing area. Export drafts when you’re ready (see “Missing features” below for PDF export).

All books, themes, and essays stay in your account—private, organized, and ready whenever you sit down to read or write.

---

## Missing Features

The following were removed because including them caused the site to break:

- **Password reset through email** — Not implemented; had to be removed to keep the site stable.
- **Exporting notes to PDF** — Not implemented; had to be removed to keep the site stable.

---

## Difficulties in This Process

- The main difficulty was **verifying that all features worked correctly** and **getting the text boxes to behave properly**. It took considerable trial and error to create text boxes that were not laggy and did not ignore inputs.
