# YOROZU IT landing page prototype

A multilingual, dependency-free static landing page for YOROZU IT. Japanese, German and English pages share one HTML template and use JSON translation files.

## Requirements

- Node.js 18 or newer
- No npm packages required

## Build and preview

```sh
npm run build
npm start
```

Open <http://127.0.0.1:4173> for Japanese, `/de/` for German, and `/en/` for English. The server serves the generated `dist/` folder.

## GitHub Pages

The generated site is in `dist/`, so publishing the repository root displays GitHub's README instead of the landing page. A GitHub Actions workflow builds and publishes `dist/` when you push to `main`.

1. Push `.github/workflows/pages.yml` to the `main` branch.
2. In the repository, open **Settings > Pages** and set **Build and deployment > Source** to **GitHub Actions**.
3. Wait for the **Deploy static site to GitHub Pages** workflow to finish in the **Actions** tab.
4. Open the Pages URL shown in the deployment or Settings page. For this repository it is normally `https://tobeadragon.github.io/yorozuit/`.

The workflow builds links with the `/yorozuit/` project path, so assets and language switching work on GitHub Pages.

## Google Sheets connection

The form sends JSON to a Google Apps Script web app. The spreadsheet ID stays in Apps Script and is not included in the public site.

1. Create or choose a spreadsheet owned by your Google account and copy its ID from the spreadsheet URL.
2. Open Google Apps Script, create a project, and paste in `apps-script/Code.gs`.
3. In Apps Script project settings, add a script property named `SPREADSHEET_ID` with your spreadsheet ID as its value.
4. Deploy the project as a web app, executing as your account and allowing access to anyone. Copy the deployed URL ending in `/exec`.
5. Set that URL as `googleSheetsWebAppUrl` in `src/js/config.js`, then run `npm run build` and redeploy the generated `dist/` files.

The script creates a `Contact requests` tab and adds a header row when needed. The public web app URL can be called by anyone, so the endpoint uses server-side field validation and a honeypot, but these are not strong abuse protection. The browser uses a no-CORS request, so the page can report that it sent a request but cannot confirm that a row was written; check the spreadsheet if confirmation is needed. Do not collect real personal data until the privacy notice and consent text are finalized. Add stronger spam controls before production.

## Project files

- `src/templates/index.template.html`: shared semantic HTML template
- `src/translations/`: localized content and form choices
- `src/css/style.css`: responsive styles
- `src/js/main.js`: mobile navigation and prototype form validation
- `src/js/config.js`: public Google Apps Script web app URL setting
- `apps-script/Code.gs`: Google Sheets receiver to deploy in your Apps Script project
- `scripts/build.js`: static page, sitemap and robots.txt generator
- `.github/workflows/pages.yml`: GitHub Pages build and deployment
- `dist/`: generated site output

Add the owner's approved portrait at `src/images/profile.jpg` to include it in the build. Until then, the hero uses a non-personal illustration. Replace the clearly marked pricing and legal placeholders and add verified business contact details before production.
