# Cloudflare Pages Deployment Guide

Since your code is already on GitHub, the easiest way to deploy is using Cloudflare Pages Git integration.

## Method 1: Git Integration (Recommended)

1.  **Log in** to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3.  Select your repository: `chronofin`.
4.  **Configure Build Settings**:
    *   **Framework preset**: Select `Vite`.
    *   **Build command**: `npm run build` (should be auto-filled).
    *   **Build output directory**: `dist` (should be auto-filled).
5.  Click **Save and Deploy**.

Cloudflare will now build your site and deploy it. Any future pushes to the `main` branch will automatically trigger a new deployment.

## Method 2: CLI Deployment

If you prefer to deploy from your command line:

1.  **Install dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Build the project**:
    ```bash
    npm run build
    ```

3.  **Deploy using Wrangler**:
    ```bash
    npx wrangler pages deploy dist --project-name chronofin
    ```
    *   You will be asked to log in to Cloudflare if you haven't already.
    *   Select "Create a new project" if prompted.

## Note on Database (D1)

Currently, the app uses **local mock data** (in `src/contexts/DataContext.jsx`). The `wrangler.toml` file contains configuration for a D1 database, but the app logic hasn't been connected to it yet.

**Your deployed site will work as a static app** (data will reset on refresh/revisit unless we add local storage persistence or connect the real backend).

If you want to persist data, we need to:
1.  Enable **Local Storage** (easiest for now).
2.  Or implement the **D1 Backend** (requires more work to move logic to Cloudflare Functions).
