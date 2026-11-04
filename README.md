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

## Legal pages

The static build creates `/impressum/` and `/datenschutz/` as `index.html` routes, which work with GitHub Pages and direct refreshes. Both pages use German legal content regardless of the homepage language. All editable business details are centralized in `src/config/businessInfo.ts`; the page layout and legal text do not need manual edits when those values change. The Steuernummer is kept separate and is never rendered. The USt-IdNr. is rendered only when supplied.

During local development, missing required values trigger a console warning and visible placeholders. A production build (`NODE_ENV=production`) fails until required business information is complete; the GitHub Pages workflow sets this mode to prevent publishing draft legal pages. The telephone number and responsible person are optional unless applicable; if responsible-person information is started, both name and address are required. Review the hosting and data-protection arrangement for the GitHub account before publication; the pages link to GitHub's published Pages and privacy documentation.

## Google Sheets connection

The form is currently a non-connected prototype. The spreadsheet ID stays in Apps Script and is not included in the public site.

1. Create or choose a spreadsheet owned by your Google account and copy its ID from the spreadsheet URL.
2. Open Google Apps Script, create a project, and paste in `apps-script/Code.gs`.
3. In Apps Script project settings, add a script property named `SPREADSHEET_ID` with your spreadsheet ID as its value.
4. Deploy the project as a web app, executing as your account and allowing access to anyone. Copy the deployed URL ending in `/exec`.
5. Before enabling the endpoint, update and verify the privacy notice and form consent copy to describe the actual recipient, purposes, legal basis, and retention. Then set the URL as `googleSheetsWebAppUrl` in `src/js/config.js`, run `npm run build`, and redeploy the generated `dist/` files. The build intentionally stops if an endpoint is configured while the notice still describes the disconnected prototype.

The script creates a `Contact requests` tab and adds a header row when needed. The public web app URL can be called by anyone, so the endpoint uses server-side field validation and a honeypot, but these are not strong abuse protection. The browser uses a no-CORS request, so the page can report that it sent a request but cannot confirm that a row was written; check the spreadsheet if confirmation is needed. Do not collect real personal data until the privacy notice and consent text are finalized. Add stronger spam controls before production.

## Project files

- `src/templates/index.template.html`: shared semantic HTML template
- `src/templates/legal.template.html`: shared German legal-page shell
- `src/config/businessInfo.ts`: centralized business and publication-readiness information
- `src/translations/`: localized content and form choices
- `src/css/style.css`: responsive styles
- `src/js/main.js`: mobile navigation and prototype form validation
- `src/js/config.js`: public Google Apps Script web app URL setting
- `apps-script/Code.gs`: Google Sheets receiver to deploy in your Apps Script project
- `scripts/build.js`: static page, legal-page, sitemap and robots.txt generator
- `.github/workflows/pages.yml`: GitHub Pages build and deployment
- `dist/`: generated site output

## Content data

- `src/data/case-studies.json`: the five multilingual illustrative enquiry examples. Keep the disclaimer in the translations; these are not client case histories.
- `src/data/projects.json`: starts empty. Add an item with localized `title`, `work_description`, and `period`, a `service_category` (`general`, `web`, `purchase`, `internet`, or `smart-home`), optional `technologies`, and `publication_permission: true` only after approval. Project images belong under `src/images/projects/`; set `image` to a relative path inside that folder, such as `site-preview.webp`.
- `src/data/reviews.json`: starts empty. Add the provided `review_id`, `customer_comment`, `service_category`, `display_name`, `review_date`, `language`, optional real `rating`, and `publication_permission: true` only after the reviewer has agreed to publication. Leave `display_name` empty to show the localized anonymous label. Comments are shown in their original language.
- `src/translations/{ja,de,en}.json`: the owner's supplied personal background and the localized headings and empty-state copy for these sections.

Add a project to the `items` array using localized copy. Project images should be placed in `src/images/projects/` and referenced by a path relative to that directory:

```json
{
	"title": {"ja": "制作タイトル", "de": "Projekttitel", "en": "Project title"},
	"service_category": "web",
	"work_description": {"ja": "作業内容", "de": "Beschreibung", "en": "Work description"},
	"technologies": ["HTML", "CSS"],
	"image": "sample.webp",
	"period": {"ja": "2026年", "de": "2026", "en": "2026"},
	"publication_permission": true
}
```

Reviews use the requested `review_id`, `customer_comment`, `service_category`, `display_name`, `review_date`, `language`, optional real `rating`, and `publication_permission` fields. Only entries with `publication_permission: true` are shown. Leave `display_name` empty for the localized anonymous label; the comment remains in its original language. Ratings are shown only when an integer from 1 to 5 is provided. No review or rating structured data is generated. Run `npm run build` after editing content data.

Add the owner's approved portrait at `src/images/profile.jpg` to include it in the build. Until then, the hero uses a non-personal illustration. Before production, add verified business contact details in `scripts/build.js`, review the legal content for the actual business and hosting arrangement, and replace the clearly marked pricing placeholder. The legal pages must not be treated as publication-ready while their draft warning is shown.
