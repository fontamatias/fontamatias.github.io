/* ============================================================
   app.js — Portfolio logic
   - Loads project list from assets/projects.json
   - Fetches each repo from GitHub API
   - Renders project cards with name, description, language,
     stars, repo link, homepage
   - Handles loading, error and missing-description states
   ============================================================ */

(async function () {
  'use strict';

  /* ----------------------------------------------------------
     Mobile nav toggle
  ---------------------------------------------------------- */
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('#site-nav .nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     Active nav link on scroll
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('#site-nav .nav-links a');

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 80) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ----------------------------------------------------------
     Scroll-reveal
  ---------------------------------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    // 12% of the element visible is enough to trigger the reveal animation
  const REVEAL_THRESHOLD = 0.12;
  const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: REVEAL_THRESHOLD });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    // skip animation, show immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     Language color map (same as CSS data-lang, duplicated
     here so we can set the dot color in JS-generated HTML)
  ---------------------------------------------------------- */
  const LANG_COLORS = {
    Python:     '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Java:       '#b07219',
    HTML:       '#e34c26',
    CSS:        '#563d7c',
    Shell:      '#89e051',
    Go:         '#00ADD8',
    Ruby:       '#701516',
    PHP:        '#4F5D95',
    C:          '#555555',
    'C++':      '#f34b7d',
  };

  /* ----------------------------------------------------------
     SVG icons (inline, no external dependency)
  ---------------------------------------------------------- */
  const ICONS = {
    repo:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/></svg>`,
    star:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`,
    link:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z"/></svg>`,
    code:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H11.01a2.25 2.25 0 0 0-2.25 2.25.75.75 0 0 1-1.5 0A2.25 2.25 0 0 0 5.01 13H.75a.75.75 0 0 1-.75-.75Zm7.25 10.32.003-8.073a2.25 2.25 0 0 0-2.25-2.247H1.5v9h3.51a3.756 3.756 0 0 1 2.24.82Zm1.5 0a3.755 3.755 0 0 1 2.24-.82H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.247l.003 8.073Z"/></svg>`,
    warn:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>`,
    github: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
  };

  /* ----------------------------------------------------------
     Projects section elements
  ---------------------------------------------------------- */
  const projectsSection = document.getElementById('proyectos');
  if (!projectsSection) return;

  const container = projectsSection.querySelector('[data-projects-container]');
  if (!container) return;

  /* ----------------------------------------------------------
     Show skeleton loading cards
  ---------------------------------------------------------- */
  function showLoading(count) {
    const wrap = document.createElement('div');
    wrap.className = 'projects-skeleton';
    wrap.setAttribute('aria-label', 'Cargando proyectos…');
    wrap.setAttribute('aria-busy', 'true');
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'skeleton-card';
      sk.setAttribute('aria-hidden', 'true');
      wrap.appendChild(sk);
    }
    container.appendChild(wrap);
    return wrap;
  }

  /* ----------------------------------------------------------
     Show error message
  ---------------------------------------------------------- */
  function showError(message) {
    container.innerHTML = `
      <div class="projects-error" role="alert">
        ${ICONS.warn}
        <span>${message}</span>
      </div>`;
  }

  /* ----------------------------------------------------------
     Render a single project card
  ---------------------------------------------------------- */
  function renderCard(repo, index) {
    const card = document.createElement('article');
    card.className = 'project-card reveal';
    card.style.animationDelay = `${index * 0.08}s`;

    const langColor = repo.language ? (LANG_COLORS[repo.language] || '#888') : null;

    const descHtml = repo.description
      ? escapeHtml(repo.description)
      : '<em>Sin descripción</em>';

    const langHtml = langColor
      ? `<span class="project-lang" data-lang="${escapeHtml(repo.language)}">
           <span class="lang-dot" style="background:${langColor}"></span>
           ${escapeHtml(repo.language)}
         </span>`
      : '';

    const starsHtml = repo.stargazers_count > 0
      ? `<span class="project-stars">${ICONS.star} ${repo.stargazers_count}</span>`
      : '';

    const repoLinkHtml = `
      <a href="${escapeHtml(repo.html_url)}"
         target="_blank" rel="noopener noreferrer"
         class="project-link"
         aria-label="Código fuente de ${escapeHtml(repo.name)}">
        ${ICONS.code} Código
      </a>`;

    const homepageLinkHtml = repo.homepage
      ? `<a href="${escapeHtml(repo.homepage)}"
            target="_blank" rel="noopener noreferrer"
            class="project-link"
            aria-label="Demo de ${escapeHtml(repo.name)}">
           ${ICONS.link} Demo
         </a>`
      : '';

    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-icon">${ICONS.repo}</span>
      </div>
      <h3 class="project-name">${escapeHtml(repo.name)}</h3>
      <p class="project-desc">${descHtml}</p>
      <div class="project-meta">
        ${langHtml}
        ${starsHtml}
      </div>
      <div class="project-links">
        ${repoLinkHtml}
        ${homepageLinkHtml}
      </div>`;

    return card;
  }

  /* ----------------------------------------------------------
     Simple HTML escape
  ---------------------------------------------------------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ----------------------------------------------------------
     Fetch a single GitHub repo
  ---------------------------------------------------------- */
  async function fetchRepo(fullName) {
    const url = `https://api.github.com/repos/${fullName}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        throw new Error('rate_limit');
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }

  /* ----------------------------------------------------------
     Main: load projects.json → fetch repos → render cards
  ---------------------------------------------------------- */
  let projectList;
  try {
    const cfgRes = await fetch('assets/projects.json');
    if (!cfgRes.ok) throw new Error('config');
    projectList = await cfgRes.json();
  } catch {
    showError('No se pudo cargar la configuración de proyectos.');
    return;
  }

  const skeleton = showLoading(projectList.length);

  const results = await Promise.allSettled(
    projectList.map(p => fetchRepo(p.repo))
  );

  skeleton.remove();

  const grid = document.createElement('div');
  grid.className = 'projects-grid';

  let allFailed = true;
  let rateLimited = false;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allFailed = false;
      const card = renderCard(result.value, i);
      grid.appendChild(card);
    } else {
      if (result.reason?.message === 'rate_limit') rateLimited = true;
      // render a minimal error card for this specific repo
      const errCard = document.createElement('article');
      errCard.className = 'project-card';
      errCard.innerHTML = `
        <div class="project-card-header"><span class="project-icon">${ICONS.repo}</span></div>
        <h3 class="project-name">${escapeHtml(projectList[i].repo.split('/')[1])}</h3>
        <p class="project-desc"><em>No se pudo cargar este proyecto.</em></p>
        <div class="project-links">
          <a href="https://github.com/${escapeHtml(projectList[i].repo)}"
             target="_blank" rel="noopener noreferrer"
             class="project-link">
            ${ICONS.code} Ver en GitHub
          </a>
        </div>`;
      grid.appendChild(errCard);
    }
  });

  if (allFailed) {
    const msg = rateLimited
      ? 'Se alcanzó el límite de la API de GitHub. Intentá nuevamente en unos minutos.'
      : 'No se pudieron cargar los proyectos. Revisá tu conexión e intentá más tarde.';
    showError(msg);
    return;
  }

  container.appendChild(grid);

  // trigger scroll-reveal for freshly added cards
  if (!prefersReduced) {
    grid.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('visible')) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              obs.unobserve(e.target);
            }
          });
        }, { threshold: REVEAL_THRESHOLD });
        obs.observe(el);
      }
    });
  } else {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}());
