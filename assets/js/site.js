const locale = document.documentElement.lang === 'fa' ? 'fa-IR' : 'en-US';
for (const element of document.querySelectorAll('[data-since]')) {
  const start = Date.parse(`${element.dataset.since}T00:00:00Z`);
  if (Number.isFinite(start)) {
    element.textContent = Math.max(0, Math.floor((Date.now() - start) / 86400000)).toLocaleString(locale);
  }
}
for (const element of document.querySelectorAll('[data-today]')) {
  const today = new Date();
  element.dateTime = today.toISOString().slice(0, 10);
  element.textContent = today.toLocaleDateString(`${locale}-u-ca-gregory`, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.url);
      status.textContent = button.dataset.copied;
    } catch {
      status.textContent = button.dataset.url;
    }
  });
}
