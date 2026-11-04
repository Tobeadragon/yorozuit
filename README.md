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

## Add project examples and customer reviews

The project examples and reviews are content-managed as JSON, independently of the page layout. Each file has an `items` array, so add one object per entry; the renderer displays every approved entry in that array. There is no fixed item limit. The site is static, so rebuild and push the changes to publish them:

1. Edit `src/data/projects.json` and/or `src/data/reviews.json`.
2. Add another object inside the existing `"items": [...]` array. Use a unique kebab-case ID for each record.
3. Keep `"publication_permission": false` until you have the person's/customer's written permission and any necessary image rights. Change it to `true` only for approved content.
4. Put project images in `src/images/projects/` and use a relative path for the `image` value. Omit `image` if there is no approved image.
5. Run `npm run build`, review the local site, then commit and push. The GitHub Pages workflow rebuilds all languages and publishes the updated entries.

The build validates each record and stops with the file/field that needs attention. Projects require `project_id`, localized `title` and `work_description` in JA/DE/EN, a supported `service_category` (`general`, `web`, `purchase`, `internet`, `smart-home`, or `other`), and a boolean `publication_permission`. `period` may be a shared string or localized object; `technologies` and `image` are optional.

```json
{
  "project_id": "unique-project-slug",
  "title": {"ja": "（掲載する日本語タイトル）", "de": "（掲載するドイツ語タイトル）", "en": "（掲載する英語タイトル）"},
  "service_category": "web",
  "work_description": {"ja": "（日本語の説明）", "de": "（ドイツ語の説明）", "en": "（英語の説明）"},
  "technologies": ["HTML", "CSS"],
  "image": "project-image.webp",
  "period": {"ja": "2026年", "de": "2026", "en": "2026"},
  "publication_permission": false
}
```

Reviews require a unique `review_id`, the original non-empty `customer_comment`, `service_category`, `display_name` (empty string to display anonymously), valid `review_date` in `YYYY-MM-DD` format, `language` (`ja`, `de`, or `en`), and a boolean `publication_permission`. `rating` is optional and, when included, must be an integer from 1 to 5. The comment is displayed in its original language; do not translate, alter, or invent customer feedback. Keep a record of consent outside the public repository. No review/rating structured data is generated.

```json
{
  "review_id": "unique-review-slug",
  "customer_comment": "（掲載同意を得た原文の感想）",
  "service_category": "general",
  "display_name": "",
  "review_date": "2026-01-31",
  "language": "ja",
  "rating": 5,
  "publication_permission": false
}
```

The snippets above are field templates only; replace every example value with verified content before adding them to `items`. Never put private customer information or unapproved materials in the public repository, even when `publication_permission` is false. The build rejects duplicate IDs, missing translations, invalid categories or dates, and missing project image files.

`src/data/case-studies.json` contains illustrative enquiries, not real project or customer references. Its existing disclaimer must remain. `src/translations/{ja,de,en}.json` contains the section headings and empty-state copy.

## Add multiple prices

The pricing section is a responsive table. Add one object for each price under the `pricing.items` array in each language file: `src/translations/ja.json`, `src/translations/de.json`, and `src/translations/en.json`. Each row has a `name`, `amount`, and `description`; use the correct translation and verified price in every language. Duplicate the existing row to add another one. The build checks that each row has all three non-empty fields. After editing, run `npm run build`, then commit and push to publish.

Add the owner's approved portrait at `src/images/profile.jpg` to include it in the build. Until then, the hero uses a non-personal illustration. Before production, review the legal content for the actual business and hosting arrangement. The legal pages must not be treated as publication-ready while their draft warning is shown.
