# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/254a98d2-6713-4f71-ad52-3ff3a755d020

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/254a98d2-6713-4f71-ad52-3ff3a755d020) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Setting up the application

This application consists of three main components:
1. The React frontend (Vite)
2. Supabase for data storage
3. FastAPI backend for transcript processing and MCQ generation

### Setting up the Environment

Copy the `.env.example` file to create your own `.env` file:

```sh
cp .env.example .env
```

Then edit the `.env` file to include your Supabase credentials and Gemini API key.

### Running Frontend and Backend

#### Frontend Setup
```sh
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at http://localhost:8080

#### FastAPI Backend Setup

The application includes a FastAPI backend for real-time transcript processing and MCQ generation with Google's Gemini API.

1. Install Python dependencies:
```sh
pip install fastapi uvicorn pydantic python-dotenv google-generativeai supabase sqlite3
```

2. Start the FastAPI server:
```sh
uvicorn realtime_transcript:app --reload --port 8000
```

The backend API will be available at http://localhost:8000

#### Testing the MCQ Generation

To test the MCQ generation from lecture transcripts:

```sh
python generation+db.py
```

This script connects to the FastAPI server to get the latest transcript, generates an MCQ using Gemini API, and stores it in both SQLite and Supabase.

#### Supabase Setup (Cloud)

This project uses Supabase as a backend service, which is already deployed in the cloud. The connection details are configured in the project.

If you want to use your own Supabase instance:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Update your `.env` file with your Supabase credentials
3. Restart the frontend development server for the changes to take effect

#### Optional: Configure Local Supabase Development Environment

If you want to run Supabase locally for development:

1. Install the Supabase CLI: [Instructions](https://supabase.com/docs/guides/cli)
2. Initialize Supabase locally:
   ```sh
   supabase init
   ```
3. Start the local Supabase services:
   ```sh
   supabase start
   ```
4. Update your `.env` file with the local credentials that are displayed after starting Supabase

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- FastAPI (Python backend)
- Google Gemini API (AI-generated questions)
- Supabase (Backend-as-a-Service)
- SQLite (local database)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/254a98d2-6713-4f71-ad52-3ff3a755d020) and click on Share -> Publish.

For advanced deployments:
1. Build the frontend: `npm run build`
2. Deploy the generated `dist` folder to a service like Vercel, Netlify, or any other static hosting provider
3. Deploy the FastAPI backend to a service like Heroku, Render, or Railway
4. Ensure your Supabase instance is properly configured for production use with appropriate security rules

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
