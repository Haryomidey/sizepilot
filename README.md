# SizePilot

SizePilot is a browser-based file utility for compressing, converting, checking, and managing files locally. It is built with React, Vite, TypeScript, Tailwind CSS, and `pdf-lib`.

## Features

- Image optimization with format and quality controls
- Video export preparation with size and format options
- PDF tools for compressing, merging, splitting, and cleaning metadata
- File conversion for common image formats
- Requirement checker for size and format limits
- Local history for processed files
- Workspace settings stored in the browser

## Local Processing

SizePilot is designed to process files in the browser where possible. Images and PDFs are handled locally. Video support currently prepares valid exports in the browser, but full video transcoding would require an FFmpeg-based engine.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

Run the TypeScript check:

```bash
pnpm lint
```

## Project Structure

```text
src/
  components/   Shared UI components
  hooks/        Local storage helpers
  layouts/      App layout and navigation
  lib/          Utility helpers
  pages/        Main app pages
  utils/        File processing utilities
```

## Main Pages

- Dashboard
- Image Optimizer
- Video Compressor
- PDF Tools
- File Converter
- Requirement Checker
- History
- Workspace Preferences

## Notes

This project is private and currently configured as a single-page Vite app.