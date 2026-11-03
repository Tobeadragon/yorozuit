const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const languages = ['ja', 'de', 'en'];
const baseUrl = 'https://yorozuit.de';
const iconPaths = {
  chat: '<path d="M5 6.5h14v9H11l-5 3v-3H5z"/><path d="M9 10h6M9 13h4"/>',
  spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  all: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5z"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
  computer: '<rect x="3.5" y="4" width="17" height="12" rx="1.5"/><path d="M8 20h8M12 16v4M7.5 8h5M7.5 11h3"/>',
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h4M7 16h7"/>',
  devices: '<rect x="3" y="5" width="13" height="11" rx="1.5"/><path d="M7 20h5M9.5 16v4"/><rect x="17.5" y="8" width="4" height="10" rx="1"/><path d="M19 15.5h1"/>',
  wifi: '<path d="M3 9a14 14 0 0 1 18 0M6.5 12.5a8.5 8.5 0 0 1 11 0M10 16a3.2 3.2 0 0 1 4 0M12 20h.01"/>',
  home: '<path d="m3 11 9-7 9 7M5.5 9.5V20h13V9.5M9 20v-6h6v6"/>'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function valueAt(data, key) {
  return key.split('.').reduce((value, part) => value?.[part], data);
}

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.spark}</svg>`;
}

function renderBenefits(items) {
  return items.map((item, index) => `<article class="benefit-item"><span class="benefit-icon icon-tone-${index + 1}">${icon(item.icon)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div></article>`).join('');
}

function renderServices(items, contactLabel) {
  return items.map((item, index) => `<article class="service-card"><div class="service-card-top"><span class="service-icon">${icon(item.icon)}</span><span class="service-number">0${index + 1}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p><ul>${item.items.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul><a class="card-link" href="#contact">${escapeHtml(contactLabel)} <span aria-hidden="true">↗</span></a></article>`).join('');
}

function renderSteps(items) {
  return items.map((item, index) => `<div class="step"><span class="step-number">0${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('');
}

function renderFaq(items) {
  return items.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.q)}<span aria-hidden="true"></span></summary><p>${escapeHtml(item.a)}</p></details>`).join('');
}

function renderOptions(items) {
  return items.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
}

function renderPage(lang, translations, template) {
  const route = lang === 'ja' ? '/' : `/${lang}/`;
  const replacements = {
    lang,
    canonical: `${baseUrl}${route}`,
    homeUrl: route,
    year: new Date().getFullYear(),
    jaActive: lang === 'ja' ? 'is-active' : '',
    deActive: lang === 'de' ? 'is-active' : '',
    enActive: lang === 'en' ? 'is-active' : '',
    profileImage: fs.existsSync(path.join(root, 'src/images/profile.jpg')) ? '<img src="/images/profile.jpg" alt="">' : 'Y',
    benefits: renderBenefits(translations.benefits),
    serviceCards: renderServices(translations.serviceCards, translations.ui.navContact),
    steps: renderSteps(translations.process.steps),
    faqs: renderFaq(translations.faq.items),
    areaList: translations.area.places.map((place) => `<span>${escapeHtml(place)}</span>`).join(''),
    languageOptions: renderOptions(translations.form.languageOptions),
    serviceOptions: renderOptions(translations.form.serviceOptions)
  };

  return template.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
    if (Object.hasOwn(replacements, key)) return replacements[key];
    const value = valueAt(translations, key);
    if (value === undefined || value === null || typeof value === 'object') {
      throw new Error(`Missing or invalid translation "${key}" for ${lang}`);
    }
    return escapeHtml(value);
  });
}

fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
fs.mkdirSync(path.join(dist, 'de'), { recursive: true });
fs.mkdirSync(path.join(dist, 'en'), { recursive: true });
fs.mkdirSync(path.join(dist, 'images'), { recursive: true });
const template = fs.readFileSync(path.join(root, 'src/templates/index.template.html'), 'utf8');

for (const lang of languages) {
  const translations = JSON.parse(fs.readFileSync(path.join(root, `src/translations/${lang}.json`), 'utf8'));
  const html = renderPage(lang, translations, template);
  const output = lang === 'ja' ? path.join(dist, 'index.html') : path.join(dist, lang, 'index.html');
  fs.writeFileSync(output, html);
  console.log(`Built ${path.relative(root, output)}`);
}

for (const asset of ['style.css', 'main.js', 'logo.svg']) {
  const source = asset === 'style.css' ? 'src/css/style.css' : asset === 'main.js' ? 'src/js/main.js' : 'src/images/logo.svg';
  fs.copyFileSync(path.join(root, source), path.join(dist, 'assets', asset));
}
const profileImage = path.join(root, 'src/images/profile.jpg');
if (fs.existsSync(profileImage)) fs.copyFileSync(profileImage, path.join(dist, 'images/profile.jpg'));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${languages.map((lang) => `  <url><loc>${baseUrl}${lang === 'ja' ? '/' : `/${lang}/`}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://yorozuit.de/sitemap.xml\n');
console.log('Built sitemap.xml and robots.txt');
