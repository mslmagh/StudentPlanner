# AI Study Partner Finder

Frontend prototype of an education-focused partner-matching system inspired by Uber-style matching. Students create study requests and receive suggested study partners based on course, level, and time compatibility.

## Project Description

This project is a Homework 2 submission that includes:
- A working frontend-only website
- Simulated matching process and results
- Mock data–driven rule-based matching logic
- AI agent planning document for future architecture

No backend is used in the current version.

## Features

- Home page with project introduction and CTA
- Create Request page with required fields:
  - Course
  - Level (Beginner / Intermediate / Advanced)
  - Preferred Time
  - Study Type (Online / In-person)
- Matching page with staged loading simulation:
  - Searching for study partners...
  - Analyzing schedules...
  - Matching skill levels...
- Active Sessions page listing matched partners (mock data)
- Navigation bar between all pages

## Technologies Used

- React (Vite)
- React Router DOM
- Plain CSS
- Static JSON data (mock)

## Project Structure

```text
StudentPlanner/
├─ src/
│  ├─ components/
│  │  └─ Navbar.jsx
│  ├─ pages/
│  │  ├─ HomePage.jsx
│  │  ├─ CreateRequestPage.jsx
│  │  ├─ MatchingPage.jsx
│  │  └─ ActiveSessionsPage.jsx
│  ├─ data/
│  │  ├─ mockPartners.json
│  │  └─ mockSessions.json
│  ├─ utils/
│  │  └─ matching.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ index.html
├─ package.json
├─ planning-document.md
└─ README.md
```

## Screenshots

Add UI screenshots under `docs/screenshots/` using these filenames:

- `home.png`
- `create-request.png`
- `matching-loading.png`
- `matching-results.png`
- `active-sessions.png`

Example markdown preview (already compatible with GitHub):

```markdown
![Home](./docs/screenshots/home.png)
![Create Request](./docs/screenshots/create-request.png)
![Matching Loading](./docs/screenshots/matching-loading.png)
![Matching Results](./docs/screenshots/matching-results.png)
![Active Sessions](./docs/screenshots/active-sessions.png)
```

## Setup Instructions

### Prerequisites
- Node.js 18+ (recommended)
- npm 9+

### Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

## Build for Production

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Deployment Instructions

### Option A: Vercel
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repo.
3. Framework preset: **Vite** (auto-detected in most cases).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

### Option B: Netlify
1. Push this repository to GitHub.
2. Go to [Netlify](https://netlify.com) and create a new site from Git.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy site.

## Planning Document

See the AI agent planning file:

- [planning-document.md](./planning-document.md)

This document explains the transition from current rule-based mock matching to a future CrewAI multi-agent architecture.