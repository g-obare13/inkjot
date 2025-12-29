# Inkjot

A lightweight, personal note-taking application designed for those who want a simple, cost-effective way to manage notes and lists without the overhead of premium subscriptions.

## Preview
| Application UI | Gemini AI Integration |
|---|---|
| ![Inkjot UI Preview](/one.jpeg) | ![Gemini AI Features](/gemini.jpeg) |

## Why I Built This
I created this app because I wanted a dedicated space to manage my notes and lists for my own use without paying for monthly subscriptions. It serves as a functional tool for my daily life and a practical way to sharpen my coding skills. 

This project is a personal sandbox where I can build exactly what I need while staying hands-on with the latest web technologies.

## Privacy & Data
Privacy is a core focus of this project. 
- **Local Storage:** All your notes and drawing data are stored directly in your browser's local memory (localStorage or IndexedDB).
- **No External Sync:** Your data is not uploaded to a central database or shared with any third-party services.
- **You Own Your Data:** Everything stays on your device.

## Current Focus: Gemini AI Integration
I am currently in the process of integrating **Google Gemini** to add intelligent features like:
- Smart tagging and categorization.
- Summarizing long-form notes.
- Generating action items from lists.

*Note: The Gemini integration is currently a work in progress. I am still finalizing the implementation and will update the documentation once the AI features are fully stable.*

## Technologies Used
- **Vite** - High-performance frontend tooling.
- **TypeScript** - For type-safe development.
- **React** - Component-based UI library.
- **shadcn-ui** - Accessible UI component primitives.
- **Tailwind CSS** - Utility-first CSS framework.

## Getting Started

Follow these steps to get your local development environment running:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone the Repository
```sh
git clone <YOUR_GIT_URL>
cd inkjot

```

### 3. Install Dependencies

```sh
npm install

```

### 4. Run the Development Server

```sh
npm run dev

```

The application will be available at `http://localhost:8080`.

### 5. Build for Production

To create an optimized production build:

```sh
npm run build

```

## Future Roadmap

* [ ] Finish Gemini AI integration.
* [ ] Drawing canvas for handwritten sketches.
* [ ] Offline support via PWA (Progressive Web App).
* [ ] Local backup/export to JSON.

## License

MIT - Feel free to fork this for your own personal use!
