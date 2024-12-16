# Sprache - Learn German with AI

Sprache is a web application designed to help users learn German using the power of AI. The application leverages OpenAI's text-to-speech capabilities to provide an interactive learning experience.\
Its basically built on top of [OpenAI's Whisper API](https://openai.com/blog/whisper/).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [POST /api/v1/speech](#post-apiv1speech)
- [File Structure](#file-structure)

## Installation

1. **Clone the repository**:

   ```bash
   git clone git@github.com:shadmeoli/sprache.ai.git
   cd sprache
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root of the project and add your OpenAI API key:

   ```env
   GEMMINIAPI_KEY=your-openai-api-key
   ```

4. **Run the development server**:

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

Navigate to the homepage, where you can interact with the AI-powered German learning tool. Input your text prompts and receive audio responses in German.

## API

### POST /api/v1/speech

This endpoint generates a speech audio file from a given text prompt using OpenAI's text-to-speech model.

#### Request

- **URL**: `/api/v1/speech`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "Your text prompt here"
  }
  ```

#### Response

- **Success**:
  - **Status**: `200 OK`
  - **Body**: Audio file in `mp3` format.
  - **Headers**: `Content-Type: audio/mpeg`
- **Error**:
  **Error**: `429 Too Many Requests`, if the API rate limit is exceeded. This basically happends if you've not payed for the OpenAI API.
  - **Body**:
    ```json
    {
      "message": "🥺 Looks like I've not paid, Ooops!"
    }
    ```

#### Example

**Request**:

```bash
curl -X POST http://localhost:3000/api/v1/speech -H "Content-Type: application/json" -d '{"prompt": "Hallo, wie geht es Ihnen?"}'
```

**Response**:
An audio file in `mp3` format is returned.

## File Structure

The project directory is structured as follows:

```
├── package.json
├── postcss.config.cjs
├── prettier.config.js
├── prisma
│   ├── db.sqlite
│   └── schema.prisma
├── public
│   ├── book.png
│   └── favicon.ico
├── README.md
├── src
│   ├── app
│   │   ├── api
│   │   │   └── v1
│   │   │       └── speech
│   │   │           └── route.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── assets
│   ├── audio
│   ├── components
│   │   └── ui
│   │       ├── input.tsx
│   │       ├── sonner.tsx
│   │       └── textarea.tsx
│   ├── env.js
│   ├── lib
│   │   └── utils.ts
│   ├── server
│   │   └── db.ts
│   └── styles
│       └── globals.css
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files and Directories

- **`src/app/api/v1/speech/route.tsx`**: API route handler for the speech endpoint.
- **`src/components/ui`**: UI components such as `input`, `textarea`, and `sonner`.
- **`src/styles/globals.css`**: Global CSS styles.
- **`prisma/db.sqlite`**: SQLite database file.
- **`public`**: Public assets including images and favicon.

---

I have alse setup a model for logging the prompts and the responses. But I have not implement it yet.
Feel if you want to do it, just create a prims client on the [api/v1/speech](./src/app/api/v1/speech/route.tsx) and setup the write.

> Don't forget to push your database to create a Local database with sqlite and run the migration.
