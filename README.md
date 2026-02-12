# PresentMax AI Presentation Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Plate JS](https://img.shields.io/badge/Plate.js-3B82F6?logoColor=white)](https://platejs.org)

⭐ **Help us grow the PresentMax community. Star this repo!**

PresentMax is an open-source, AI-powered presentation generator that creates beautiful, customizable slides in minutes. A powerful alternative to Gamma.app, designed for creators, educators, and professionals.

## 🔗 Quick Links

- [Live Demo](https://present-max.vercel.app)
- [Video Tutorial](https://www.youtube.com/watch?v=your-video-link)
- [GitHub Repository](https://github.com/thecoachmanuel/PresentMax)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [Usage](#-usage)
  - [Creating a Presentation](#creating-a-presentation)
  - [Custom Themes](#custom-themes)
- [Local Models Guide](#-local-models-guide)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Features

### Core Functionality

- **AI-Powered Content Generation**: Create complete presentations on any topic with AI.
- **Customizable Slides**: Choose the number of slides, language, and page style.
- **Editable Outlines**: Review and modify AI-generated outlines before finalizing.
- **Real-Time Generation**: Watch your presentation build live as content is created.
- **Auto-Save**: Everything saves automatically as you work.

### Design & Customization

- **Multiple Themes**: 9 built-in themes with a powerful theme creator.
- **Custom Theme Creation**: Create and save your own themes from scratch.
- **Full Editability**: Modify text, fonts, and design elements using the Plate Editor.
- **AI Image Generation**: Integrated with Together AI for high-quality slide images.
- **Audience-Focused Styles**: Select between professional and casual presentation styles.

### Presentation Tools

- **Presentation Mode**: Present directly from the application.
- **Rich Text Editing**: Powered by Plate Editor for comprehensive text and image handling.
- **Drag and Drop**: Intuitive slide reordering and element manipulation using DND Kit.
- **PPTX Export**: Export your generated presentations to PowerPoint format.

## 🧰 Tech Stack

| Category           | Technologies               |
| ------------------ | -------------------------- |
| **Framework**      | Next.js 15, React 19, TS   |
| **Styling**        | Tailwind CSS               |
| **Database**       | Supabase (PostgreSQL)      |
| **AI Integration** | OpenAI, Together AI, Tavily|
| **Authentication** | NextAuth.js & Supabase     |
| **UI Components**  | Radix UI, Framer Motion    |
| **Text Editor**    | Plate Editor (Slate-based) |
| **File Uploads**   | UploadThing                |
| **ORM**            | Prisma                     |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager
- Supabase account (for DB and Auth)
- Required API keys:
  - `OPENAI_API_KEY` (Content generation)
  - `TOGETHER_AI_API_KEY` (Image generation)
  - `TAVILY_API_KEY` (Web search)
  - `UPLOADTHING_TOKEN` (File uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/thecoachmanuel/PresentMax.git
   cd PresentMax
   ```

2. **Install dependencies**

   ```bash
   npx pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory (refer to `.env.example`).

### Database Setup

1. **Push the schema**

   ```bash
   npx pnpm db:push
   ```

2. **Start the development server**

   ```bash
   npx pnpm dev
   ```

## 💻 Usage

1. **Login**: Authenticate using your preferred method.
2. **Topic**: Enter your presentation topic in the dashboard.
3. **Configure**: Select slide count, language, and style.
4. **Outline**: Generate and refine the AI outline.
5. **Theme**: Choose or create a theme.
6. **Generate**: Watch PresentMax build your slides in real-time.
7. **Refine**: Use the rich text editor to make final adjustments.
8. **Present**: Use the built-in presentation mode or export to PPTX.

## 🧠 Local Models Guide

PresentMax supports local LLMs via Ollama or LM Studio for privacy-focused content generation.

### Ollama Setup
1. Install [Ollama](https://ollama.com).
2. Pull a model: `ollama pull llama3.1`.
3. Configure the local endpoint in the app settings.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgements

- [Plate.js](https://platejs.org) for the incredible editor framework.
- [Next.js](https://nextjs.org) for the robust web framework.
- [Supabase](https://supabase.com) for the seamless backend integration.
