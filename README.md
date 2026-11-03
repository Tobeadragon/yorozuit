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

## Project files

- `src/templates/index.template.html`: shared semantic HTML template
- `src/translations/`: localized content and form choices
- `src/css/style.css`: responsive styles
- `src/js/main.js`: mobile navigation and prototype form validation
- `scripts/build.js`: static page, sitemap and robots.txt generator
- `dist/`: generated site output

Add the owner's approved portrait at `src/images/profile.jpg` to include it in the build. Until then, the hero uses a non-personal illustration. Replace the clearly marked pricing and legal placeholders, add verified business contact details, and connect the form to a consent-compliant service before production.
