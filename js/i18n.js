// ===== i18n (Internationalization) Module =====
let currentLang = localStorage.getItem('wah-lang') || 'en';
let translations = {};

export async function initI18n() {
  const response = await fetch('/data/translations.json');
  translations = await response.json();
  applyLanguage(currentLang);
}

export function getCurrentLang() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] || key;
}

export function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('wah-lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang]?.[key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang]?.[key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // Dispatch event for other modules
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}
