// SVG icon sprite + tap-friendly tooltips (Parecer 13 — Julia Rennó)
(function () {
  /* ── Sprite: ícones de traço, herdam currentColor via .ic ── */
  const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><defs>
    <g id="i-arrow-left"><path d="M15 5l-7 7 7 7"/></g>
    <g id="i-user"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19.5c1-3.5 3.6-5 6.5-5s5.5 1.5 6.5 5"/></g>
    <g id="i-present"><rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M12 16v4M8 20h8"/></g>
    <g id="i-clipboard"><rect x="6" y="4" width="12" height="17" rx="1.6"/><path d="M9 3.5h6v2.5H9zM8.5 12l2.2 2.2L15 10"/></g>
    <g id="i-play"><path d="M8 5.5v13l10-6.5z"/></g>
    <g id="i-sun"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></g>
    <g id="i-moon"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 105.6 15.4A8 8 0 0020 14.5z"/></g>
    <g id="i-layers"><path d="M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4"/></g>
    <g id="i-car"><path d="M4 13l1.6-4.4A2 2 0 017.5 7h9a2 2 0 011.9 1.3L20 13M4 13h16v4a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-1h-9v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z"/><circle cx="7" cy="16" r="1"/><circle cx="17" cy="16" r="1"/></g>
    <g id="i-bank"><path d="M4 10l8-5 8 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/></g>
    <g id="i-wrench"><path d="M14.5 6a4.5 4.5 0 00-6 5.3l-4.6 4.6a2 2 0 102.8 2.8l4.6-4.6A4.5 4.5 0 0018.5 10l-2.7 2.7-2.5-.6-.6-2.5L14.5 6z"/></g>
    <g id="i-percent"><path d="M6 18L18 6"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></g>
    <g id="i-scale"><path d="M12 4v16M7 20h10M6 6h12M6 6l-3 6a3 3 0 006 0zM18 6l-3 6a3 3 0 006 0z"/></g>
    <g id="i-chart"><path d="M4 20V4M4 20h16M8 20v-6M13 20v-10M18 20V8"/></g>
    <g id="i-target"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></g>
    <g id="i-bulb"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0012 3z"/></g>
    <g id="i-trophy"><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M10 15h4l1 4H9z"/></g>
    <g id="i-check"><path d="M5 13l4 4L19 7"/></g>
    <g id="i-chevron"><path d="M9 6l6 6-6 6"/></g>
    <g id="i-plus"><path d="M12 5v14M5 12h14"/></g>
    <g id="i-info"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></g>
    <g id="i-alert"><path d="M12 4l9 16H3zM12 10v5M12 18h.01"/></g>
  </defs></svg>`;

  function icon(name, cls) {
    return `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }
  window.icon = icon;

  function init() {
    document.body.insertAdjacentHTML('afterbegin', SPRITE);

    /* substitui marcadores [data-ic="nome"] por SVG */
    document.querySelectorAll('[data-ic]').forEach(el => {
      const nm = el.getAttribute('data-ic');
      const lg = el.hasAttribute('data-ic-lg');
      el.insertAdjacentHTML('afterbegin', icon(nm, lg ? 'ic-lg' : ''));
      el.removeAttribute('data-ic');
    });

    /* tooltips respondem a toque: tabindex + toggle .open no clique */
    document.querySelectorAll('.tip[data-tip]').forEach(t => {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'button');
      t.setAttribute('aria-label', 'Mais informação');
      t.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = t.classList.contains('open');
        document.querySelectorAll('.tip.open').forEach(o => o.classList.remove('open'));
        if (!wasOpen) t.classList.add('open');
      });
      t.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
        if (e.key === 'Escape') t.classList.remove('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.tip.open').forEach(o => o.classList.remove('open'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
