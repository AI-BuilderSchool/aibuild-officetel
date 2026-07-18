---
name: deploy-verify
description: The verify-then-ship workflow for this static site (aibuild-officetel) — preview a change locally with a Node static server, drive it with Playwright to catch console/network errors, then commit, push to GitHub, and manually deploy to Vercel production since GitHub auto-deploy isn't connected. Use this any time a change to index.html, css/style.css, or js/main.js is about to be treated as "done," or when the user says something like "커밋하고 푸쉬해줘," "배포해줘," "확인해줘," or asks to ship/verify a change.
---

# Deploy & verify (aibuild-officetel)

This repo is plain HTML/CSS/JS with no build step and no CI/CD. Nothing is "done" until it has been visually/functionally verified locally, pushed to GitHub, and deployed to Vercel — because Vercel does not auto-deploy from GitHub here (the GitHub account is an org member, not owner, so the Vercel GitHub App can't be installed). See `CLAUDE.md` for that context.

## The sequence

1. **Serve locally.** No real Python is installed on this machine (the `python3` on PATH is a Windows Store stub). Use a small Node static server instead:
   ```js
   // minimal static file server, port 8813
   const http = require('http');
   const fs = require('fs');
   const path = require('path');
   const root = process.argv[2] || '.';
   const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
                   '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };
   http.createServer((req, res) => {
     const filePath = path.join(root, decodeURIComponent(req.url.split('?')[0]));
     fs.readFile(filePath, (err, data) => {
       if (err) { res.writeHead(404); return res.end('not found'); }
       res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
       res.end(data);
     });
   }).listen(8813, () => console.log('listening on 8813'));
   ```
   Run it in the background (`run_in_background: true`) pointed at the repo root, so it doesn't block the rest of the sequence.

2. **Verify with Playwright**, against `http://localhost:8813/index.html`. Playwright is not globally installed — install it in the scratchpad directory (`npm init -y && npm install playwright && npx playwright install chromium`) the first time it's needed in a session. A verification script should, at minimum:
   - Navigate with `waitUntil: 'networkidle'`
   - Register `pageerror`, `console` (type `error`), and `requestfailed` listeners and assert they're empty
   - Assert the specific thing that changed (computed style, class toggle, element text/position — whatever the change was)
   - Take a screenshot of the affected region for visual confirmation, and actually look at it with Read before calling the change correct
   - For layout-affecting changes, check multiple viewport widths (this repo has a history of a GNB clipping bug that only showed up in an 861–1279px range)

   Stop the server when verification is done (`pkill -f <servername>.js` or kill the background task).

3. **Commit.** Stage only the files that actually changed. Write the commit message around *why*, not a restatement of the diff.

4. **Push:** `git push`.

5. **Deploy:** `vercel --prod --yes`. This project is already linked (`.vercel/` exists), so no `vercel link` is needed.

6. **Confirm production:** `curl -s -o /dev/null -w "%{http_code}\n" https://aibuild-officetel.vercel.app` should return `200`. If the change touched a specific asset (e.g. a new image), curl that asset URL too.

7. Report back to the user in Korean, concise: what changed, what was verified, and confirmation that GitHub + Vercel production are both updated.

## Image sourcing note

If the change involves adding stock photos (as with the gallery section), verify each candidate's license via WebFetch before downloading — Unsplash "Free" vs "Unsplash+ Premium" thumbnails look identical; the licensing status only shows up on the photo detail page. Reject premium images even if they're the best visual match.
