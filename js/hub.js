const STORAGE_KEY = 'studithme-last-subject';

/**
 * @typedef {{ id: string, label: string, href: string, at: number }} LastSubject
 */

/** @returns {LastSubject | null} */
function readLast() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.id !== 'string' || typeof data.href !== 'string') return null;
    return data;
  } catch {
    return null;
  }
}

/** @param {LastSubject} subject */
function writeLast(subject) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subject));
  } catch {
    /* ignore quota / private mode */
  }
}

function renderContinue() {
  const panel = document.querySelector('[data-continue]');
  const link = document.querySelector('[data-continue-link]');
  const label = document.querySelector('[data-continue-label]');
  if (!panel || !link || !label) return;

  const last = readLast();
  if (!last) {
    panel.classList.remove('is-visible');
    panel.hidden = true;
    return;
  }

  label.textContent = last.label;
  link.href = last.href;
  panel.hidden = false;
  panel.classList.add('is-visible');
}

function bindSubjectLinks() {
  document.querySelectorAll('[data-subject]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      const id = anchor.getAttribute('data-subject') || '';
      const label = anchor.getAttribute('data-label') || id;
      const href = anchor.getAttribute('href') || '';
      writeLast({ id, label, href, at: Date.now() });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindSubjectLinks();
  renderContinue();
});
