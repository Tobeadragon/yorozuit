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

const form = document.querySelector('#contact-form');
if (form) {
  const status = document.querySelector('#form-status');
  const messages = {
    required: document.documentElement.lang === 'ja' ? 'この項目を入力してください。' : document.documentElement.lang === 'de' ? 'Bitte füllen Sie dieses Feld aus.' : 'Please complete this field.',
    email: document.documentElement.lang === 'ja' ? 'メールアドレスの形式をご確認ください。' : document.documentElement.lang === 'de' ? 'Bitte prüfen Sie das Format Ihrer E-Mail-Adresse.' : 'Please check the email address format.',
    short: document.documentElement.lang === 'ja' ? 'もう少し詳しく入力してください。' : document.documentElement.lang === 'de' ? 'Bitte geben Sie etwas mehr Details an.' : 'Please add a little more detail.',
    consent: document.documentElement.lang === 'ja' ? '送信には同意が必要です。' : document.documentElement.lang === 'de' ? 'Bitte stimmen Sie der Verarbeitung zu.' : 'Your consent is required.',
    success: document.documentElement.lang === 'ja' ? '入力内容を確認しました。このプロトタイプからデータは送信されません。' : document.documentElement.lang === 'de' ? 'Eingaben geprüft. Über diesen Prototyp wurden keine Daten versendet.' : 'Details checked. No information was sent from this prototype.'
  };

  const controls = [...form.querySelectorAll('input, select, textarea')];
  controls.forEach((control) => control.addEventListener('input', () => {
    control.removeAttribute('aria-invalid');
    const error = form.querySelector(`[data-error="${control.name}"]`);
    if (error) error.textContent = '';
    if (status) status.textContent = '';
  }));

  form.addEventListener('submit', (event) => {
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
    if (status) status.textContent = messages.success;
  });
}
