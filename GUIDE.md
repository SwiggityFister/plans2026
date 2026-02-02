# Step-by-Step Hosting Guide

Follow these steps to put your **2026 Work Plan Dashboard** online so you can access it from anywhere.

### Phase 1: Create your GitHub Repository
1.  **Sign in to GitHub**: Go to [github.com](https://github.com) and log in.
2.  **New Repository**: Click the **"+"** icon in the top right and select **"New repository"**.
3.  **Name it**: Give it a name like `work-plan-2026`.
4.  **Public/Private**: You can choose **Public** (anyone can see the code) or **Private** (only you can see the code).
5.  **Create**: Click the green **"Create repository"** button at the bottom.

### Phase 2: Upload your Files
1.  On the "Quick Setup" page that appears, look for the link that says: **"uploading an existing file"**.
2.  **Drag and Drop**: Open your folder on your computer and drag **all** your files (`index.html`, `App.tsx`, `package.json`, etc.) into the GitHub browser window.
3.  **Commit**: Once they finish uploading, scroll down. In the "Commit changes" box, type "Initial upload" and click **"Commit changes"**.

### Phase 3: Deploy to Vercel (Recommended)
*Vercel is the easiest way to host React apps. It's free and connects directly to your GitHub.*

1.  Go to [Vercel.com](https://vercel.com) and click **"Start Deploying"**.
2.  Select **"Continue with GitHub"** and authorize it.
3.  You will see a list of your repositories. Find `work-plan-2026` and click **"Import"**.
4.  **Skip Configuration**: Vercel will automatically detect that you are using Vite/React. You don't need to change any settings.
5.  **Deploy**: Click **"Deploy"**.
6.  **Success!** In about 30-60 seconds, you will see confetti and a link (e.g., `work-plan-2026.vercel.app`).

---

### Important Notes
*   **Saving Data**: This app uses `localStorage`. This means if you add tasks on your **Laptop**, you won't see them if you open the link on your **Phone**. The data stays on the device where you typed it.
*   **Updates**: If you want to change the code later, just go to your GitHub repository, click on the file you want to change, click the **Pencil icon**, edit the text, and commit. Vercel will automatically detect the change and update your website in seconds!
