const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const languages = ['ja', 'de', 'en'];
const siteUrl = (process.env.SITE_URL || 'https://yorozuit.de').replace(/\/+$/, '');
const baseSegments = (process.env.BASE_PATH || '').split('/').filter(Boolean);
const basePath = baseSegments.length ? `/${baseSegments.join('/')}/` : '';
const legalInfoSource = fs.readFileSync(path.join(root, 'src/config/businessInfo.ts'), 'utf8');
const legalInfoModule = { exports: {} };
const legalInfoCode = `${legalInfoSource.replace(/\bexport\s+const\s+/g, 'const ')}\nmodule.exports = { businessInfo, legalInformationComplete };`;
require('node:vm').runInNewContext(legalInfoCode, { module: legalInfoModule, exports: legalInfoModule.exports });
const { businessInfo, legalInformationComplete } = legalInfoModule.exports;
const developmentBuild = process.env.NODE_ENV !== 'production';
const legalUpdatedAt = '4. November 2026';
const requiredBusinessInformation = [
    ['Unternehmensname', businessInfo.businessName],
    ['Rechtsform', businessInfo.legalForm],
    ['vollständiger Name der Inhaberin oder des Inhabers', businessInfo.ownerName],
    ['Straße und Hausnummer', businessInfo.address.street],
    ['Postleitzahl', businessInfo.address.postalCode],
    ['Ort', businessInfo.address.city],
    ['Land', businessInfo.address.country],
    ['geschäftliche E-Mail-Adresse', businessInfo.contact.email]
];
const missingRequiredInformation = requiredBusinessInformation
    .filter(([, value]) => typeof value !== 'string' || !value.trim())
    .map(([label]) => label);
if ((businessInfo.responsiblePerson.name.trim() || businessInfo.responsiblePerson.address.trim()) &&
    (!businessInfo.responsiblePerson.name.trim() || !businessInfo.responsiblePerson.address.trim())) {
    missingRequiredInformation.push('vollständige Angaben zur verantwortlichen Person');
}

if (!legalInformationComplete && !developmentBuild) {
    throw new Error('Production build blocked: complete required business information in src/config/businessInfo.ts before publishing legal pages.');
}
if (!legalInformationComplete) {
    console.warn(`Development warning: legal information is incomplete (${missingRequiredInformation.join(', ')}). Legal pages will contain development-only placeholders and must not be published.`);
}

const configSource = fs.readFileSync(path.join(root, 'src/js/config.js'), 'utf8');
const formEndpoint = configSource.match(/googleSheetsWebAppUrl:\s*(['"])(.*?)\1/);
if (!formEndpoint) throw new Error('Could not verify the contact form endpoint in src/js/config.js');

function publicPath(route) {
    const relativePath = route.replace(/^\/+/, '');
    return basePath ? `${basePath}${relativePath}` : `/${relativePath}`;
}

function absoluteUrl(route) {
    return `${siteUrl}${publicPath(route)}`;
}

const pngLogo = path.join(root, 'src/images/yorozu_logo.png');
const logoAsset = fs.existsSync(pngLogo) ? 'yorozu_logo.png' : 'logo.svg';
const logoUrl = publicPath(`/assets/${logoAsset}`);
const logoMimeType = logoAsset.endsWith('.png') ? 'image/png' : 'image/svg+xml';

const iconPaths = {
    chat: '<path d="M5 6.5h14v9H11l-5 3v-3H5z"/><path d="M9 10h6M9 13h4"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    all: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5z"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    computer: '<rect x="3.5" y="4" width="17" height="12" rx="1.5"/><path d="M8 20h8M12 16v4M7.5 8h5M7.5 11h3"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h4M7 16h7"/>',
    devices: '<rect x="3" y="5" width="13" height="11" rx="1.5"/><path d="M7 20h5M9.5 16v4"/><rect x="17.5" y="8" width="4" height="10" rx="1"/><path d="M19 15.5h1"/>',
    wifi: '<path d="M3 9a14 14 0 0 1 18 0M6.5 12.5a8.5 8.5 0 0 1 11 0M10 16a3.2 3.2 0 0 1 4 0M12 20h.01"/>',
    home: '<path d="m3 11 9-7 9 7M5.5 9.5V20h13V9.5M9 20v-6h6v6"/>',
    ai: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M9.5 2.5v4M14.5 2.5v4M9.5 17.5v4M14.5 17.5v4M2.5 9.5h4M2.5 14.5h4M17.5 9.5h4M17.5 14.5h4"/><path d="m12 9 1 2 2 .8-2 .8-1 2-1-.2-.8-1.8-2-.8 2-.8z"/>'
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

function renderPricingItems(items, labels) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('pricing.items must contain at least one price entry');
    }

    return `<div class="pricing-table-wrap"><table class="pricing-table" aria-labelledby="pricing-title"><thead><tr><th scope="col">${escapeHtml(labels.itemLabel)}</th><th scope="col">${escapeHtml(labels.priceLabel)}</th><th scope="col">${escapeHtml(labels.detailsLabel)}</th></tr></thead><tbody>${items.map((item, index) => {
        for (const field of ['name', 'amount', 'description']) {
            if (typeof item[field] !== 'string' || !item[field].trim()) {
                throw new Error(`pricing.items[${index}].${field} must be a non-empty string`);
            }
        }
        return `<tr><th scope="row" data-label="${escapeHtml(labels.itemLabel)}">${escapeHtml(item.name)}</th><td data-label="${escapeHtml(labels.priceLabel)}">${escapeHtml(item.amount)}</td><td data-label="${escapeHtml(labels.detailsLabel)}">${escapeHtml(item.description)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderFaq(items) {
    return items.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.q)}<span aria-hidden="true"></span></summary><p>${escapeHtml(item.a)}</p></details>`).join('');
}

function renderOptions(items) {
    return items.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
}

function renderHeroTitle(title) {
    return String(title).split('\n').map((line, index) => {
        const accentClass = index === 1 ? ' hero-title-accent' : '';
        return `<span class="hero-title-line${accentClass}">${escapeHtml(line)}</span>`;
    }).join('');
}

function localizedText(value, lang) {
    if (typeof value === 'string') return value;
    return value?.[lang] || value?.en || value?.ja || '';
}

function serviceTitle(serviceId, translations) {
    const option = translations.form.serviceOptions.find(([value]) => value === serviceId);
    return option ? option[1] : '';
}

function renderOwnerProfile(profile) {
    return `<section class="owner-profile" aria-labelledby="owner-profile-title"><div class="owner-profile-copy"><p class="eyebrow">${escapeHtml(profile.eyebrow)}</p><h3 id="owner-profile-title">${escapeHtml(profile.title)}</h3><p>${escapeHtml(profile.body)}</p></div><ul class="owner-facts">${profile.facts.map((fact) => `<li>${icon('pin')}<span>${escapeHtml(fact)}</span></li>`).join('')}</ul><p class="owner-profile-note">${escapeHtml(profile.disclaimer)}</p></section>`;
}

function renderCaseStudies(items, lang, labels, translations) {
    return items.map((item, index) => `<article class="case-card"><div class="case-card-top"><span class="service-icon">${icon(item.icon)}</span><span class="service-number">CASE ${String(index + 1).padStart(2, '0')}</span></div><h3>${escapeHtml(localizedText(item.title, lang))}</h3><div class="case-block"><h4>${escapeHtml(labels.scenarioLabel)}</h4><p>${escapeHtml(localizedText(item.scenario, lang))}</p></div><div class="case-block"><h4>${escapeHtml(labels.supportLabel)}</h4><ul>${(item.support[lang] || item.support.en || []).map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul></div><a class="card-link" href="#contact">${escapeHtml(labels.contactLink)} <span aria-hidden="true">↗</span></a></article>`).join('');
}

function projectImageUrl(image) {
    if (typeof image !== 'string' || !image.trim()) return '';
    const relativePath = image.replace(/\\/g, '/');
    if (relativePath.startsWith('/') || relativePath.split('/').includes('..')) return '';
    return publicPath(`/images/projects/${relativePath}`);
}

function renderProjects(data, lang, labels, translations) {
    const items = (data.items || []).filter((item) => item.publication_permission === true);
    if (items.length === 0) {
        return `<div class="empty-state"><span class="empty-state-icon">${icon('web')}</span><h3>${escapeHtml(labels.emptyTitle)}</h3><p>${escapeHtml(labels.emptyBody)}</p></div>`;
    }

    return `<div class="work-grid">${items.map((item) => {
        const title = localizedText(item.title, lang);
        const imageUrl = projectImageUrl(item.image);
        const technologies = Array.isArray(item.technologies) ? item.technologies : [];
        return `<article class="work-card">${imageUrl ? `<img class="work-image" src="${imageUrl}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">` : ''}<div class="work-card-body"><div class="work-meta"><span>${escapeHtml(serviceTitle(item.service_category, translations) || labels.categoryLabel)}</span>${item.period ? `<time>${escapeHtml(localizedText(item.period, lang))}</time>` : ''}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(localizedText(item.work_description, lang))}</p>${technologies.length ? `<div class="work-tools"><span>${escapeHtml(labels.toolsLabel)}</span>${technologies.map((technology) => `<span>${escapeHtml(technology)}</span>`).join('')}</div>` : ''}</div></article>`;
    }).join('')}</div>`;
}

function renderReviews(data, lang, labels, translations) {
    const items = (data.items || []).filter((item) => item.publication_permission === true);
    if (items.length === 0) {
        return `<div class="empty-state"><span class="empty-state-icon">${icon('chat')}</span><h3>${escapeHtml(labels.emptyTitle)}</h3><p>${escapeHtml(labels.emptyBody)}</p></div>`;
    }

    return `<div class="reviews-grid">${items.map((item) => {
        const reviewLanguage = ['ja', 'de', 'en'].includes(item.language) ? item.language : lang;
        const rating = Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5
            ? `<span class="review-rating" aria-label="${escapeHtml(labels.ratingLabel)}: ${item.rating}/5">${item.rating}/5</span>`
            : '';
        const reviewDate = item.review_date ? `<time>${escapeHtml(item.review_date)}</time>` : '';
        return `<article class="review-card" lang="${reviewLanguage}"><div class="review-card-top">${escapeHtml(serviceTitle(item.service_category, translations))}${rating}</div><blockquote>${escapeHtml(item.customer_comment)}</blockquote><footer><span>${escapeHtml(item.display_name || labels.anonymous)}</span>${reviewDate}</footer></article>`;
    }).join('')}</div>`;
}

function validateContentData(data) {
    const supportedServices = new Set(['general', 'web', 'purchase', 'internet', 'smart-home', 'ai', 'other']);
    const localizedFields = (value, label) => {
        if (typeof value === 'string') {
            if (!value.trim()) throw new Error(`${label} must not be empty`);
            return;
        }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`${label} must be a non-empty string or translations for ja, de, and en`);
        }
        for (const lang of languages) {
            if (typeof value[lang] !== 'string' || !value[lang].trim()) {
                throw new Error(`${label}.${lang} must be a non-empty string`);
            }
        }
    };
    const uniqueId = (id, label, seen) => {
        if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
            throw new Error(`${label} must be a unique kebab-case ID`);
        }
        if (seen.has(id)) throw new Error(`${label} "${id}" is duplicated`);
        seen.add(id);
    };

    for (const [collectionName, collection] of [['projects', data.projects], ['reviews', data.reviews]]) {
        if (!collection || !Array.isArray(collection.items)) {
            throw new Error(`src/data/${collectionName}.json must contain an "items" array`);
        }
    }

    const projectIds = new Set();
    const projectImages = path.join(root, 'src/images/projects');
    data.projects.items.forEach((project, index) => {
        const label = `projects.items[${index}]`;
        if (!project || typeof project !== 'object' || Array.isArray(project)) {
            throw new Error(`${label} must be an object`);
        }
        uniqueId(project.project_id, `${label}.project_id`, projectIds);
        localizedFields(project.title, `${label}.title`);
        localizedFields(project.work_description, `${label}.work_description`);
        if (!supportedServices.has(project.service_category)) {
            throw new Error(`${label}.service_category must be one of: ${[...supportedServices].join(', ')}`);
        }
        if (project.period !== undefined) localizedFields(project.period, `${label}.period`);
        if (project.technologies !== undefined &&
            (!Array.isArray(project.technologies) ||
                project.technologies.some((technology) => typeof technology !== 'string' || !technology.trim()))) {
            throw new Error(`${label}.technologies must be an array of non-empty strings`);
        }
        if (project.image !== undefined && project.image !== '') {
            if (typeof project.image !== 'string' || path.isAbsolute(project.image) ||
                project.image.replace(/\\/g, '/').split('/').includes('..')) {
                throw new Error(`${label}.image must be a path relative to src/images/projects`);
            }
            const imagePath = path.resolve(projectImages, project.image);
            if (!imagePath.startsWith(`${projectImages}${path.sep}`) || !fs.existsSync(imagePath) ||
                !fs.statSync(imagePath).isFile()) {
                throw new Error(`${label}.image does not exist under src/images/projects`);
            }
        }
        if (typeof project.publication_permission !== 'boolean') {
            throw new Error(`${label}.publication_permission must be true or false`);
        }
    });

    const reviewIds = new Set();
    data.reviews.items.forEach((review, index) => {
        const label = `reviews.items[${index}]`;
        if (!review || typeof review !== 'object' || Array.isArray(review)) {
            throw new Error(`${label} must be an object`);
        }
        uniqueId(review.review_id, `${label}.review_id`, reviewIds);
        if (typeof review.customer_comment !== 'string' || !review.customer_comment.trim()) {
            throw new Error(`${label}.customer_comment must be a non-empty, approved customer comment`);
        }
        if (typeof review.display_name !== 'string') {
            throw new Error(`${label}.display_name must be a string (use an empty string for anonymous display)`);
        }
        if (!languages.includes(review.language)) {
            throw new Error(`${label}.language must be one of: ${languages.join(', ')}`);
        }
        if (!supportedServices.has(review.service_category)) {
            throw new Error(`${label}.service_category must be one of: ${[...supportedServices].join(', ')}`);
        }
        const parsedReviewDate = typeof review.review_date === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(review.review_date)
            ? new Date(`${review.review_date}T00:00:00Z`)
            : null;
        if (!parsedReviewDate || Number.isNaN(parsedReviewDate.getTime()) ||
            parsedReviewDate.toISOString().slice(0, 10) !== review.review_date) {
            throw new Error(`${label}.review_date must be a valid YYYY-MM-DD date`);
        }
        if (review.rating !== undefined &&
            (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5)) {
            throw new Error(`${label}.rating must be an integer from 1 to 5 when provided`);
        }
        if (review.publication_permission !== true && review.publication_permission !== false) {
            throw new Error(`${label}.publication_permission must be true or false`);
        }
    });
}

function renderHeroArtwork(translations) {
    const profileImage = path.join(root, 'src/images/profile.jpg');
    const profileNote = `<figcaption class="profile-note"><span class="profile-avatar"><img src="${logoUrl}" alt=""></span><span><strong>${escapeHtml(translations.hero.cardTitle)}</strong><small>${escapeHtml(translations.hero.cardText)}</small></span><span class="profile-mark" aria-hidden="true">✳</span></figcaption>`;

    if (fs.existsSync(profileImage)) {
        return `<figure class="hero-portrait"><img class="hero-photo" src="${publicPath('/images/profile.jpg')}" alt="${escapeHtml(translations.hero.profileAlt)}">${profileNote}</figure>`;
    }

    return '';
}

function renderPage(lang, translations, template, siteData) {
    const route = lang === 'ja' ? '/' : `/${lang}/`;
    const replacements = {
        lang,
        canonical: absoluteUrl(route),
        alternateJa: absoluteUrl('/'),
        alternateDe: absoluteUrl('/de/'),
        alternateEn: absoluteUrl('/en/'),
        alternateDefault: absoluteUrl('/'),
        assetBase: publicPath('/assets'),
        jaUrl: publicPath('/'),
        deUrl: publicPath('/de/'),
        enUrl: publicPath('/en/'),
        homeUrl: publicPath(route),
        impressumUrl: publicPath('/impressum/'),
        privacyUrl: publicPath('/datenschutz/'),
        logoUrl,
        logoMimeType,
        heroProfileClass: fs.existsSync(path.join(root, 'src/images/profile.jpg')) ? 'hero-has-profile' : '',
        heroBackground: fs.existsSync(path.join(root, 'src/images/helo_background_image.jpeg'))
            ? `url(${publicPath('/images/helo_background_image.jpeg')})`
            : 'none',
        year: new Date().getFullYear(),
        jaActive: lang === 'ja' ? 'is-active' : '',
        deActive: lang === 'de' ? 'is-active' : '',
        enActive: lang === 'en' ? 'is-active' : '',
        heroArtwork: renderHeroArtwork(translations),
        heroTitle: renderHeroTitle(translations.hero.title),
        ownerProfile: renderOwnerProfile(translations.ownerProfile),
        benefits: renderBenefits(translations.benefits),
        serviceCards: renderServices(translations.serviceCards, translations.ui.navContact),
        caseCards: renderCaseStudies(siteData.caseStudies.items, lang, translations.caseStudies, translations),
        projectContent: renderProjects(siteData.projects, lang, translations.projectsSection, translations),
        reviewContent: renderReviews(siteData.reviews, lang, translations.reviewsSection, translations),
        steps: renderSteps(translations.process.steps),
        pricingItems: renderPricingItems(translations.pricing.items, translations.pricing),
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

function renderLegalPage(template, page) {
    const developmentValue = (value) => value.trim()
        ? escapeHtml(value.trim())
        : developmentBuild ? '<span class="legal-placeholder">[Bitte Geschäftsdaten ergänzen]</span>' : '';
    const address = `<address>${[
        developmentValue(businessInfo.address.street),
        `${developmentValue(businessInfo.address.postalCode)} ${developmentValue(businessInfo.address.city)}`,
        developmentValue(businessInfo.address.country)
    ].join('<br>')}</address>`;
    const email = businessInfo.contact.email.trim()
        ? `<p>E-Mail: <a href="mailto:${escapeHtml(businessInfo.contact.email.trim())}">${escapeHtml(businessInfo.contact.email.trim())}</a></p>`
        : developmentBuild ? `<p>E-Mail: ${developmentValue(businessInfo.contact.email)}</p>` : '';
    const telephone = businessInfo.contact.telephone.trim()
        ? `<p>Telefon: <a href="tel:${escapeHtml(businessInfo.contact.telephone.trim())}">${escapeHtml(businessInfo.contact.telephone.trim())}</a></p>`
        : developmentBuild ? `<p>Telefon: ${developmentValue(businessInfo.contact.telephone)}</p>` : '';
    const vatSection = businessInfo.tax.vatId.trim()
        ? `<section><h2>Umsatzsteuer-Identifikationsnummer</h2><p>Umsatzsteuer-Identifikationsnummer (USt-IdNr.) gemäß § 27a Umsatzsteuergesetz: ${escapeHtml(businessInfo.tax.vatId.trim())}</p></section>`
        : '';
    const responsiblePerson = businessInfo.responsiblePerson.name.trim() || businessInfo.responsiblePerson.address.trim()
        ? `<section><h2>Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</h2><p>${developmentValue(businessInfo.responsiblePerson.name)}</p><p>${developmentValue(businessInfo.responsiblePerson.address)}</p></section>`
        : '';
    const draftNotice = !legalInformationComplete
        ? `<aside class="legal-draft-notice" role="note"><strong>Entwurf – nicht veröffentlichungsreif</strong><p>Es fehlen oder sind unvollständig: ${missingRequiredInformation.map(escapeHtml).join(', ')}. Platzhalter werden nur in Entwicklungs-Builds angezeigt. Diese Seite darf nicht veröffentlicht werden.</p></aside>`
        : '';
    const legalContent = page.content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const contentValues = {
            address,
            businessName: escapeHtml(businessInfo.businessName.trim()),
            legalForm: escapeHtml(businessInfo.legalForm.trim()),
            ownerName: developmentValue(businessInfo.ownerName),
            email,
            emailAvailability: businessInfo.contact.email.trim()
                ? 'Sie erreichen uns unter der oben angegebenen geschäftlichen E-Mail-Adresse.'
                : 'Eine geschäftliche E-Mail-Adresse ist noch nicht veröffentlicht.',
            telephone,
            vatSection,
            responsiblePerson,
            currentDate: legalUpdatedAt
        };
        if (!Object.hasOwn(contentValues, key)) throw new Error(`Unknown legal content placeholder "${key}"`);
        return contentValues[key];
    }).replace(/^[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
    const replacements = {
        title: `${page.title} – ${businessInfo.businessName}`,
        description: `${page.description} ${businessInfo.businessName}.`,
        robots: legalInformationComplete ? 'index,follow' : 'noindex,follow',
        canonical: absoluteUrl(`/${page.slug}/`),
        logoUrl,
        logoMimeType,
        assetBase: publicPath('/assets'),
        homeUrl: publicPath('/'),
        homeServicesUrl: `${publicPath('/')}#services`,
        homeContactUrl: `${publicPath('/')}#contact`,
        jaUrl: publicPath('/'),
        deUrl: publicPath('/de/'),
        enUrl: publicPath('/en/'),
        impressumUrl: publicPath('/impressum/'),
        privacyUrl: publicPath('/datenschutz/'),
        impressumCurrent: page.slug === 'impressum' ? 'aria-current="page"' : '',
        privacyCurrent: page.slug === 'datenschutz' ? 'aria-current="page"' : '',
        year: new Date().getFullYear(),
        breadcrumb: page.heading,
        heading: page.heading,
        headingMarkup: page.slug === 'datenschutz' ? 'Datenschutz&shy;erklärung' : page.heading,
        lead: page.lead,
        draftNotice,
        currentDate: legalUpdatedAt,
        content: legalContent
    };

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (!Object.hasOwn(replacements, key)) throw new Error(`Unknown legal template placeholder "${key}"`);
        return replacements[key];
    }).replace(/^[ \t]+$/gm, '');
}

fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
fs.mkdirSync(path.join(dist, 'de'), { recursive: true });
fs.mkdirSync(path.join(dist, 'en'), { recursive: true });
fs.mkdirSync(path.join(dist, 'images'), { recursive: true });
const template = fs.readFileSync(path.join(root, 'src/templates/index.template.html'), 'utf8');
const legalTemplate = fs.readFileSync(path.join(root, 'src/templates/legal.template.html'), 'utf8');
const siteData = {
    caseStudies: JSON.parse(fs.readFileSync(path.join(root, 'src/data/case-studies.json'), 'utf8')),
    projects: JSON.parse(fs.readFileSync(path.join(root, 'src/data/projects.json'), 'utf8')),
    reviews: JSON.parse(fs.readFileSync(path.join(root, 'src/data/reviews.json'), 'utf8'))
};
validateContentData(siteData);

for (const lang of languages) {
    const translations = JSON.parse(fs.readFileSync(path.join(root, `src/translations/${lang}.json`), 'utf8'));
    const html = renderPage(lang, translations, template, siteData);
    const output = lang === 'ja' ? path.join(dist, 'index.html') : path.join(dist, lang, 'index.html');
    fs.writeFileSync(output, html);
    console.log(`Built ${path.relative(root, output)}`);
}

// The current site contains service information, not journalistic-editorial content under § 18 Abs. 2 MStV.
const legalPages = [
    {
        slug: 'impressum',
        title: 'Impressum',
        description: 'Impressum und Anbieterkennzeichnung gemäß § 5 DDG.',
        heading: 'Impressum',
        lead: 'Rechtliche Informationen gemäß § 5 DDG',
        content: `        <section><h2>Angaben gemäß § 5 DDG</h2><p>Angaben zum Diensteanbieter von {{businessName}}.</p></section>
        <section><h2>Name und Anschrift des Diensteanbieters</h2><p><strong>{{businessName}} – {{legalForm}}</strong><br>{{ownerName}}</p>{{address}}</section>
            <section><h2>Kontakt</h2>{{email}}{{telephone}}</section>
            {{vatSection}}
        {{responsiblePerson}}
            <section><h2>Haftung für Inhalte</h2><p>Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen Gesetzen verantwortlich. Für die Vollständigkeit, Richtigkeit und Aktualität der Inhalte können wir dennoch keine Gewähr übernehmen. Soweit gesetzliche Haftungsprivilegierungen für übermittelte oder gespeicherte fremde Informationen gelten, bleiben diese unberührt. Bei Bekanntwerden konkreter Rechtsverletzungen entfernen wir betroffene Inhalte unverzüglich.</p></section>
            <section><h2>Haftung für Links</h2><p>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte können wir daher keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Verlinkung waren keine rechtswidrigen Inhalte erkennbar. Eine laufende Kontrolle verlinkter Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir betroffene Links unverzüglich.</p></section>
            <section><h2>Urheberrecht</h2><p>Die durch den Diensteanbieter erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der vorherigen schriftlichen Zustimmung des jeweiligen Rechteinhabers. Inhalte Dritter werden als solche kenntlich gemacht; Rechte Dritter bleiben unberührt.</p></section>
            <p class="legal-updated">Stand: {{currentDate}}</p>`
    },
    {
        slug: 'datenschutz',
        title: 'Datenschutzerklärung',
        description: 'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO und TDDDG.',
        heading: 'Datenschutzerklärung',
        lead: 'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO',
        content: `<section><h2>1. Allgemeine Hinweise</h2><p>Diese Datenschutzerklärung erläutert, welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden und welche Rechte Ihnen zustehen. Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Die Angaben beziehen sich auf die derzeitige technische Umsetzung dieser Website.</p><p>Rechtsgrundlagen sind – soweit im jeweiligen Abschnitt genannt – insbesondere Art. 6 Abs. 1 DSGVO. Informationen nach Art. 13 DSGVO zu Verantwortlichem, Zwecken, Rechtsgrundlagen, Empfängern, Speicherdauer und Ihren Rechten finden Sie in den folgenden Abschnitten.</p></section>
        <section><h2>2. Verantwortlicher</h2><p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p><p><strong>{{businessName}} – {{legalForm}}<br>{{ownerName}}</strong></p>{{address}}{{email}}{{telephone}}</section>
            <section><h2>3. Hosting und Server-Log-Dateien</h2><p>Diese Website wird als statische Website über GitHub Pages bereitgestellt. Anbieter ist GitHub, Inc. GitHub weist in der Dokumentation zu GitHub Pages darauf hin, dass bei einem Seitenaufruf die IP-Adresse der Besuchenden zu Sicherheitszwecken protokolliert und gespeichert wird. Die IP-Adresse wird dabei an GitHub übermittelt. Die Bereitstellung der Website über den Hosting-Anbieter erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung). GitHub beschreibt die Verarbeitung zu eigenen Sicherheitszwecken in seiner Datenschutzerklärung.</p><p>Die veröffentlichte GitHub-Pages-Dokumentation nennt keine konkrete Speicherregion oder Aufbewahrungsfrist für diese Zugriffsprotokolle. Deshalb machen wir hierzu keine weitergehenden Angaben. GitHub beschreibt seine Datenverarbeitung in der <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub-Datenschutzerklärung</a> und stellt eine <a href="https://github.com/customer-terms/github-data-protection-agreement">Data Protection Agreement (DPA)</a> bereit. Ob und in welchem Umfang diese Vereinbarung für das vorliegende öffentliche Hosting gilt, ist vor Veröffentlichung anhand des konkreten GitHub-Kontos und der Vertragsbedingungen zu prüfen. Informationen zu möglichen internationalen Verarbeitungen finden Sie ebenfalls in den GitHub-Unterlagen; ein bestimmter Speicherort wird hier nicht zugesichert.</p><p>Weitere Informationen zur Protokollierung von IP-Adressen durch GitHub Pages enthält die <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages">GitHub-Pages-Dokumentation</a>.</p></section>
            <section><h2>4. Kontaktaufnahme per E-Mail</h2><p>{{emailAvailability}} Wenn Sie per E-Mail Kontakt aufnehmen, verarbeiten wir die von Ihnen übermittelten Angaben (insbesondere Absenderadresse, Nachrichteninhalt und gegebenenfalls Anlagen), um Ihre Anfrage zu bearbeiten und zu beantworten. Bei vorvertraglichen Anfragen ist Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO; bei sonstigen Anfragen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Kontaktanfragen). Die Angaben sind freiwillig; ohne die zur Bearbeitung erforderlichen Informationen kann die Anfrage gegebenenfalls nicht beantwortet werden.</p></section>
            <section><h2>5. Kontaktformular</h2>

<p>

Über das Kontaktformular können Sie mit YOROZU IT Kontakt aufnehmen.

Dabei werden folgende personenbezogene Daten erhoben:

Ihr Name, Ihre E-Mail-Adresse, Ihre Nachricht sowie optional Ihre Telefonnummer.

Die Angabe der Telefonnummer ist freiwillig.

</p>

<p>

Die Übermittlung der Formulardaten erfolgt über Google Apps Script.

Die eingegebenen Daten werden verarbeitet und in einer Google-Tabelle

(Google Sheets) gespeichert. Zusätzlich werden E-Mail-Benachrichtigungen

über den Google-Dienst MailApp versendet.

Dabei erhält YOROZU IT eine Benachrichtigung über die Anfrage.

An die von Ihnen angegebene E-Mail-Adresse wird außerdem eine

Eingangsbestätigung gesendet.

</p>

<p>

Die Verarbeitung erfolgt zum Zweck der Bearbeitung Ihrer Anfrage,

der Kommunikation mit Ihnen und gegebenenfalls der Vorbereitung

vertraglicher Leistungen.

Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage

auf den Abschluss eines Vertrags gerichtet ist.

Bei sonstigen Anfragen erfolgt die Verarbeitung auf Grundlage

von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der

Bearbeitung und Beantwortung von Kontaktanfragen).

</p>

<p>

Die Speicherung der Anfragedaten erfolgt in Google Sheets.

Die Daten sollen grundsätzlich spätestens zwölf Monate nach

Abschluss der Bearbeitung gelöscht werden, sofern keine

gesetzlichen Aufbewahrungspflichten oder andere berechtigte

Gründe für eine längere Speicherung bestehen.

</p>

<p>

Bitte übermitteln Sie über das Kontaktformular keine besonders

sensiblen personenbezogenen Daten.

</p></section>
            <section><h2>6. Cookies und lokale Speicherung</h2><p>Die Website setzt nach derzeitigem Stand keine Cookies und verwendet weder localStorage noch sessionStorage oder vergleichbare Technologien, um Informationen auf Ihrem Endgerät zu speichern oder auf solche Informationen zuzugreifen. Es werden daher keine optionalen Speicher- oder Zugriffsvorgänge eingesetzt, für die eine Einwilligung nach § 25 TDDDG einzuholen wäre. Der technische Browser-Cache kann unabhängig davon durch Ihren Browser verwaltet werden.</p></section>
            <section><h2>7. Externe Dienste und Drittanbieter</h2>
            <p>
    Für die Verarbeitung von Kontaktanfragen nutzen wir Google Apps Script,
    Google Sheets und den Dienst MailApp von Google.
    Diese Dienste werden verwendet, um die über das Kontaktformular
    übermittelten Daten zu verarbeiten, zu speichern und E-Mail-Nachrichten
    zu versenden.
</p>

<p>
    Anbieter der verwendeten Dienste ist Google LLC sowie gegebenenfalls
    eine verbundene Google-Gesellschaft, abhängig von den jeweils geltenden
    Nutzungs- und Datenschutzbedingungen.
    Eine Verarbeitung personenbezogener Daten außerhalb des Europäischen
    Wirtschaftsraums kann nicht ausgeschlossen werden.
</p>

<p>
    Weitere Informationen zur Datenverarbeitung durch Google finden Sie
    in der
    <a href="https://policies.google.com/privacy?hl=de">
        Google-Datenschutzerklärung
    </a>.
</p>

<p>
    Darüber hinaus werden derzeit keine Analyse-, Werbe-, Karten-,
    Video-, Social-Media- oder externen Schrift-Dienste eingebunden.
    Insbesondere werden keine externen Google Fonts geladen.
</p>
</section>

            
            <section><h2>8. SSL-/TLS-Verschlüsselung</h2><p>Die Website ist über HTTPS erreichbar. Eine verschlüsselte Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers. Die Verschlüsselung schützt die Übertragung zwischen Ihrem Browser und dem Webangebot; sie ist keine Ende-zu-Ende-Verschlüsselung und sagt nichts über die Speicherdauer beim Hosting-Anbieter aus.</p></section>
            <section>
    <h2>9. Weitergabe personenbezogener Daten</h2>
<p>
    Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies
    für die Bereitstellung dieser Website und die Bearbeitung Ihrer
    Anfragen erforderlich ist, Sie ausdrücklich eingewilligt haben,
    eine gesetzliche Verpflichtung besteht oder dies zur Geltendmachung
    beziehungsweise Abwehr von Rechtsansprüchen erforderlich ist.
</p>

<p>
    Im Rahmen der Nutzung des Kontaktformulars werden die von Ihnen
    eingegebenen Daten über Google Apps Script verarbeitet und
    in Google Sheets gespeichert. Außerdem wird
    Google MailApp zum Versand von E-Mail-Benachrichtigungen verwendet.
    Hierbei können personenbezogene Daten an Google LLC übermittelt
    werden.
</p>

<p>
    Eine darüber hinausgehende Weitergabe personenbezogener Daten
    zu Werbe- oder Analysezwecken findet nach der derzeitigen
    technischen Umsetzung nicht statt.
</p></section>
            <section><h2>10. Speicherdauer</h2><p>
    Die über das Kontaktformular übermittelten personenbezogenen
    Daten werden über Google Apps Script verarbeitet und in
    Google Sheets gespeichert, soweit dies für die Bearbeitung
    Ihrer Anfrage erforderlich ist.
</p>

<p>
    Die gespeicherten Kontaktanfragen werden grundsätzlich
    spätestens zwölf Monate nach Abschluss der Bearbeitung
    gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten
    oder andere berechtigte Gründe für eine längere Speicherung
    bestehen.
</p>

<p>
    E-Mail-Anfragen werden gelöscht, sobald sie für die Bearbeitung
    nicht mehr erforderlich sind, soweit keine gesetzlichen
    Aufbewahrungspflichten oder berechtigten Gründe für eine
    weitere Speicherung entgegenstehen.
</p>

<p>
    Die Dauer der Speicherung von GitHub-Pages-Zugriffsprotokollen
    wird in der verfügbaren Dokumentation von GitHub nicht
    konkret angegeben. Daher können wir hierzu keine verbindliche
    Speicherfrist nennen.
</p></section>
            <section><h2>11. Rechte der betroffenen Personen</h2><p>
    Sie haben im Rahmen der gesetzlichen Voraussetzungen folgende Rechte:
</p>

<ul>
    <li>Auskunft über die verarbeiteten personenbezogenen Daten (Art. 15 DSGVO),</li>
    <li>Berichtigung unrichtiger oder unvollständiger Daten (Art. 16 DSGVO),</li>
    <li>Löschung Ihrer personenbezogenen Daten (Art. 17 DSGVO),</li>
    <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
    <li>Mitteilung über Empfänger bei Berichtigung, Löschung oder Einschränkung der Verarbeitung (Art. 19 DSGVO),</li>
    <li>Datenübertragbarkeit (Art. 20 DSGVO), soweit die gesetzlichen Voraussetzungen erfüllt sind,</li>
    <li>Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten (Art. 21 DSGVO), soweit die gesetzlichen Voraussetzungen erfüllt sind,</li>
    <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
</ul>

<p>
    Zur Ausübung Ihrer Rechte können Sie sich jederzeit an den
    Verantwortlichen wenden. Die Kontaktdaten finden Sie im Impressum.
</p>

<p>
    Darüber hinaus haben Sie das Recht, sich bei einer zuständigen
    Datenschutzaufsichtsbehörde über die Verarbeitung Ihrer
    personenbezogenen Daten zu beschweren.
</p>

<p>
    Eine automatisierte Entscheidungsfindung einschließlich
    Profiling im Sinne von Art. 22 DSGVO findet nicht statt.
</p></section>
            <section><h2>12. Beschwerderecht bei einer Datenschutzaufsichtsbehörde</h2>

    <p>

        Unbeschadet eines anderweitigen Rechtsbehelfs können Sie sich

        bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere

        in dem Mitgliedstaat Ihres gewöhnlichen Aufenthalts, Ihres

        Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes

        (Art. 77 DSGVO). Für Nordrhein-Westfalen ist die

        <a href="https://www.ldi.nrw.de/" target="_blank" rel="noopener noreferrer">

            Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen

        </a>

        zuständig.

    </p></section>
            <section><h2>13. Aktualität dieser Datenschutzerklärung</h2>

    <p>

        Diese Datenschutzerklärung entspricht dem technischen und

        organisatorischen Stand der Website zum angegebenen Datum.

        Bei Änderungen der Website, der eingesetzten Dienste oder

        der Datenverarbeitungsprozesse wird diese Datenschutzerklärung

        entsprechend aktualisiert.

    </p>

    <p class="legal-updated">Stand: {{currentDate}}</p></section>`
    }
];

for (const page of legalPages) {
    const outputDirectory = path.join(dist, page.slug);
    fs.mkdirSync(outputDirectory, { recursive: true });
    const html = renderLegalPage(legalTemplate, page);
    const output = path.join(outputDirectory, 'index.html');
    fs.writeFileSync(output, html);
    console.log(`Built ${path.relative(root, output)}`);
}

for (const asset of ['style.css', 'config.js', 'main.js', 'logo.svg']) {
    const source = asset === 'style.css' ? 'src/css/style.css' : asset === 'config.js' ? 'src/js/config.js' : asset === 'main.js' ? 'src/js/main.js' : 'src/images/logo.svg';
    fs.copyFileSync(path.join(root, source), path.join(dist, 'assets', asset));
}
if (fs.existsSync(pngLogo)) fs.copyFileSync(pngLogo, path.join(dist, 'assets', logoAsset));
const profileImage = path.join(root, 'src/images/profile.jpg');
if (fs.existsSync(profileImage)) fs.copyFileSync(profileImage, path.join(dist, 'images/profile.jpg'));
const heroBackgroundImage = path.join(root, 'src/images/helo_background_image.jpeg');
if (fs.existsSync(heroBackgroundImage)) fs.copyFileSync(heroBackgroundImage, path.join(dist, 'images/helo_background_image.jpeg'));
const projectImages = path.join(root, 'src/images/projects');
if (fs.existsSync(projectImages)) fs.cpSync(projectImages, path.join(dist, 'images/projects'), { recursive: true });

const sitemapRoutes = [
    ...languages.map((lang) => lang === 'ja' ? '/' : `/${lang}/`),
    ...(legalInformationComplete ? ['/impressum/', '/datenschutz/'] : [])
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${absoluteUrl(route)}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
console.log('Built sitemap.xml and robots.txt');
