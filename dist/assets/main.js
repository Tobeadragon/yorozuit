const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
}

if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        navigation.classList.toggle('is-open', !isOpen);
    });
    navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
}

const backToTopButton = document.querySelector('.back-to-top');
if (backToTopButton) {
    const updateBackToTopVisibility = () => {
        backToTopButton.classList.toggle('is-visible', window.scrollY >= 100);
    };

    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();
    backToTopButton.addEventListener('click', () => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });
    });
}

const form = document.querySelector('#contact-form');
if (form) {
    const status = document.querySelector('#form-status');
    const lang = document.documentElement.lang;
    const localizedMessages = {
        ja: {
            required: 'この項目を入力してください。', email: 'メールアドレスの形式をご確認ください。',
            short: 'もう少し詳しく入力してください。', consent: '送信には同意が必要です。',
            notConfigured: '送信設定がまだ完了していません。内容は送信されていません。',
            sending: '送信しています…',
            requestSent: 'お問い合わせありがとうございます。お問い合わせを受け付けました。受領確認メールをお送りしておりますので、ご確認ください。内容を確認のうえ、折り返しご連絡いたします。迷惑メールフォルダに振り分けられる場合がありますので、メールが届かない場合はご確認ください。',
            networkError: '送信中にエラーが発生しました。時間をおいて再度お試しください。'
        },
        de: {
            required: 'Bitte füllen Sie dieses Feld aus.', email: 'Bitte prüfen Sie das Format Ihrer E-Mail-Adresse.',
            short: 'Bitte geben Sie etwas mehr Details an.', consent: 'Bitte stimmen Sie der Verarbeitung zu.',
            notConfigured: 'Der Versand ist noch nicht eingerichtet. Es wurden keine Daten gesendet.',
            sending: 'Wird gesendet…',
            requestSent: 'Vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten. Eine Eingangsbestätigung wurde Ihnen per E-Mail zugesandt. Wir werden Ihre Anfrage prüfen und uns schnellstmöglich bei Ihnen melden. Bitte überprüfen Sie auch Ihren Spam-Ordner, falls Sie keine E-Mail erhalten haben.',
            networkError: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
        },
        en: {
            required: 'Please complete this field.', email: 'Please check the email address format.',
            short: 'Please add a little more detail.', consent: 'Your consent is required.',
            notConfigured: 'The send destination is not configured. Nothing was sent.',
            sending: 'Sending…',
            requestSent: 'Thank you for contacting YOROZU IT! Your inquiry has been received. A confirmation email has been sent to your email address. We will review your message and get back to you as soon as possible. Please also check your spam folder if you do not receive an email.',
            networkError: 'There was a problem sending your request. Please try again later.'
        }
    };
    const messages = localizedMessages[lang] || localizedMessages.en;
    const endpoint = window.YOROZU_CONFIG?.googleSheetsWebAppUrl?.trim() || '';

    const controls = [...form.querySelectorAll('input, select, textarea')];
    controls.forEach((control) => control.addEventListener('input', () => {
        control.removeAttribute('aria-invalid');
        const error = form.querySelector(`[data-error="${control.name}"]`);
        if (error) error.textContent = '';
        if (status) status.textContent = '';
    }));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        let firstInvalid = null;
        controls.forEach((control) => {
            if (!control.required) return;
            let message = '';
            if (control.type === 'checkbox' && !control.checked) message = messages.consent;
            else if (!control.checkValidity()) {
                if (control.type === 'email' && control.value) message = messages.email;
                else if (control.validity.tooShort) message = messages.short;
                else message = messages.required;
            }
            const error = form.querySelector(`[data-error="${control.name}"]`);
            if (error) error.textContent = message;
            if (message) {
                control.setAttribute('aria-invalid', 'true');
                if (!firstInvalid) firstInvalid = control;
            } else {
                control.removeAttribute('aria-invalid');
            }
        });
        if (firstInvalid) {
            firstInvalid.focus();
            if (status) status.textContent = '';
            return;
        }

        if (form.elements.website.value.trim()) {
            if (status) status.textContent = messages.requestSent;
            return;
        }
        if (!endpoint) {
            if (status) status.textContent = messages.notConfigured;
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.consent = form.elements.consent.checked;
        payload.pageLanguage = lang;
        submitButton.disabled = true;
        if (status) status.textContent = messages.sending;

        try {
            await fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                body: JSON.stringify(payload)
            });
            if (status) status.textContent = messages.requestSent;
        } catch (error) {
            if (status) status.textContent = messages.networkError;
        } finally {
            submitButton.disabled = false;
        }
    });
}
