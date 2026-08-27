document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const topbar = document.querySelector('.topbar');
  const nav = document.querySelector('.nav-links');
  const brand = document.querySelector('.brand');

  if (!body) return;

  // Authentication is intentionally session-only. Closing the tab/browser ends the login session.
  ['rtd-current-user', 'rtd-demo-auth', 'rtd-demo-role', 'rtd-profile', 'rtd-token'].forEach((key) => {
    try { localStorage.removeItem(key); } catch {}
  });

  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '☰';
  menuToggle.setAttribute('aria-label', 'Toggle navigation');
  nav.insertAdjacentElement('beforebegin', menuToggle);

  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.setAttribute('aria-label', 'Toggle dark mode');
  themeToggle.innerHTML = '☀︎';
  topbar.appendChild(themeToggle);

  // Lightweight startup overlay: the dashboard is always allowed to render.
  // It is intentionally independent from optional charts, localStorage, or other widgets.
  const loadingScreen = document.createElement('div');
  loadingScreen.className = 'loading-screen';
  loadingScreen.setAttribute('role', 'status');
  loadingScreen.setAttribute('aria-live', 'polite');
  loadingScreen.innerHTML = '<div class="loader"></div><p>Loading dashboard...</p>';
  body.appendChild(loadingScreen);

  let loadingDismissed = false;
  const dismissLoadingScreen = () => {
    if (loadingDismissed) return;
    loadingDismissed = true;
    loadingScreen.classList.add('fade');
    window.setTimeout(() => loadingScreen.remove(), 350);
  };

  // Never let a slow optional feature keep the whole frontend behind the loader.
  const loadingFailsafe = window.setTimeout(dismissLoadingScreen, 1200);
  window.addEventListener('load', () => {
    window.clearTimeout(loadingFailsafe);
    window.requestAnimationFrame(dismissLoadingScreen);
  }, { once: true });

  const canvas = document.createElement('canvas');
  canvas.className = 'particles-canvas';
  body.appendChild(canvas);

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '↑';
  backToTop.setAttribute('aria-label', 'Back to top');
  body.appendChild(backToTop);

  const notificationStack = document.createElement('div');
  notificationStack.className = 'notification-stack';
  body.appendChild(notificationStack);

  const chatbotToggle = document.createElement('button');
  chatbotToggle.className = 'chatbot-toggle';
  chatbotToggle.innerHTML = '🤖';
  chatbotToggle.setAttribute('aria-label', 'Open AI assistant');
  body.appendChild(chatbotToggle);

  const chatbotPanel = document.createElement('div');
  chatbotPanel.className = 'chatbot-panel';
  chatbotPanel.innerHTML = `
    <div class="chatbot-header">
      <strong>Demo AI Assistant</strong>
      <button class="chatbot-close">×</button>
    </div>
    <div class="chatbot-messages"></div>
    <div class="chatbot-quick-actions">
      <button data-action="Explain dashboard">Explain dashboard</button>
      <button data-action="Data troubleshooting">Data troubleshooting</button>
      <button data-action="Predictive recommendations">Predictive recommendations</button>
    </div>
    <div class="chatbot-input-row">
      <input type="text" placeholder="Ask about analytics, data streams, or alerts..." />
      <button class="chatbot-send">Send</button>
    </div>
  `;
  body.appendChild(chatbotPanel);

  const heroContent = document.querySelector('.hero-content');
  const clock = document.createElement('div');
  clock.className = 'live-clock';
  heroContent?.appendChild(clock);

  const headerActions = document.querySelector('.header-actions');
  const notificationToggle = document.querySelector('.notification-toggle');
  const notificationPanel = document.getElementById('notification-panel');
  const notificationList = document.getElementById('notification-list');
  const notificationHistory = document.getElementById('notification-history');
  const notificationBadge = document.getElementById('notification-badge');
  const notificationCounterPill = document.getElementById('notification-counter-pill');
  const globalSearchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  const searchClear = document.getElementById('search-clear');
  const profileForm = document.getElementById('profile-form');
  const profileNameInput = document.getElementById('profile-name-input');
  const profileEmailInput = document.getElementById('profile-email-input');
  const profileRoleInput = document.getElementById('profile-role-input');
  const profileDisplayName = document.getElementById('profile-display-name');
  const profileDisplayRole = document.getElementById('profile-display-role');
  const profileDisplayEmail = document.getElementById('profile-display-email');
  const profileDisplayStatus = document.getElementById('profile-display-status');
  const profileDisplayLogin = document.getElementById('profile-display-login');
  const refreshInsightsButton = document.getElementById('refresh-insights');
  const insightsContainer = document.getElementById('ai-insights');
  const recommendationText = document.getElementById('recommendation-text');
  const comparisonRange = document.getElementById('comparison-range');
  const comparisonChange = document.getElementById('comparison-change');
  const comparisonTrend = document.getElementById('comparison-trend');
  const reportSummary = document.getElementById('report-summary');
  const settingsNotifications = document.getElementById('settings-notifications');
  const settingsRefresh = document.getElementById('settings-refresh');
  const accentColorSelect = document.getElementById('accent-color');
  const compactToggle = document.getElementById('compact-dashboard-toggle');
  const comfortableToggle = document.getElementById('comfortable-dashboard-toggle');
  const toggleKpi = document.getElementById('toggle-kpi');
  const toggleCharts = document.getElementById('toggle-charts');
  const toggleFeed = document.getElementById('toggle-feed');
  const dashboardLayout = document.getElementById('dashboard-layout');
  const resetDashboardButton = document.getElementById('reset-dashboard');
  const markAllReadButton = document.getElementById('mark-all-read');
  const clearAllNotificationsButton = document.getElementById('clear-all-notifications');

  const loginModal = document.getElementById('login');
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const identityField = document.getElementById('login-identity');
  const passwordField = document.getElementById('login-password');
  const passwordToggle = document.querySelector('.password-toggle');
  const registerModal = document.getElementById('register-modal');
  const registerForm = document.getElementById('register-form');
  const registerStatus = document.getElementById('register-status');
  const mapMarkers = document.querySelectorAll('.map-marker');
  const mapLocation = document.getElementById('map-location');
  const mapInfo = document.getElementById('map-info');
  const settingsThemeToggle = document.getElementById('settings-theme-toggle');
  const adminDashboard = document.getElementById('admin-dashboard');
  const dashboardWelcome = document.getElementById('dashboard-welcome-message');
  const authStatusPill = document.getElementById('auth-status-pill');
  const dashboardActivity = document.getElementById('dashboard-activity');
  const dashboardNotifications = document.getElementById('dashboard-notifications');

  const defaultProfile = {
    name: 'NAGENDRA REDDY',
    email: 'reddyallamnagendra@gmail.com',
    role: 'Project Administrator'
  };
  const readStored = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { ...fallback, ...JSON.parse(value) } : { ...fallback };
    } catch {
      return { ...fallback };
    }
  };
  let profile = readStored('rtd-profile', defaultProfile);
  const adminName = profile.name;
  const adminEmail = profile.email;

  // Local demo identities keep the UI usable in static-file mode; when served by server.js, the backend auth bridge is used.
  const defaultDemoUsers = [
    { id: 'demo-admin', name: 'NAGENDRA REDDY', email: 'reddyallamnagendra@gmail.com', username: 'admin', password: 'admin123', role: 'Admin', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'demo-viewer', name: 'Demo Viewer', email: 'viewer@realtimedata.tech', username: 'viewer', password: 'viewer123', role: 'Viewer', createdAt: '2026-01-01T00:00:00.000Z' }
  ];

  let registeredUsers = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rtd-registered-users'));
      if (Array.isArray(saved) && saved.length) return saved;
      localStorage.setItem('rtd-registered-users', JSON.stringify(defaultDemoUsers));
      return [...defaultDemoUsers];
    } catch {
      return [...defaultDemoUsers];
    }
  })();

  // Session-only authentication: never depend on localStorage for the active user.
  // This makes registered backend users survive a refresh during the current browser session,
  // while still logging out automatically when the browser tab/session is closed.
  let currentUser = (() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('rtd-current-user'));
      return saved && saved.id ? saved : null;
    } catch {
      return null;
    }
  })();

  let currentRole = currentUser?.role || 'Guest';
  let isLoggedIn = Boolean(currentUser);
  let pendingFeature = sessionStorage.getItem('rtd-pending-feature') || null;

  if (currentUser) {
    profile = {
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role === 'Admin' ? 'Project Administrator' : 'Registered Viewer'
    };
  }

  const authButton = document.createElement(isLoggedIn ? 'button' : 'a');
  authButton.className = 'btn btn-secondary small auth-toggle';
  authButton.textContent = isLoggedIn ? 'Logout' : 'Login';
  if (!isLoggedIn) {
    authButton.setAttribute('href', '#login');
  }
  headerActions?.querySelector('a[href="#login"]')?.remove();
  headerActions?.appendChild(authButton);

  const logoutButton = document.createElement('button');
  logoutButton.className = 'btn btn-secondary small logout-btn';
  logoutButton.textContent = 'Logout';
  adminDashboard?.querySelector('.section-heading')?.appendChild(logoutButton);

  const applyTheme = (theme) => {
    body.classList.toggle('light', theme === 'light');
    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀︎';
    settingsThemeToggle && (settingsThemeToggle.textContent = theme === 'light' ? 'Switch to Dark' : 'Switch to Light');
    localStorage.setItem('rtd-theme', theme);
  };

  const savedTheme = localStorage.getItem('rtd-theme') || 'dark';
  applyTheme(savedTheme);

  // Feature-isolated navigation: after login, only the selected top-level feature is visible.
  let featureItems = Array.from(document.querySelectorAll('main > .hero, main > .section'));
  let featureIds = new Set(featureItems.map((item) => item.id || (item.classList.contains('hero') ? 'home' : '')).filter(Boolean));
  const refreshFeatureIndex = () => {
    featureItems = Array.from(document.querySelectorAll('main > .hero, main > .section'));
    featureIds = new Set(featureItems.map((item) => item.id || (item.classList.contains('hero') ? 'home' : '')).filter(Boolean));
  };

  const showFeature = (id = 'dashboard', updateHash = true) => {
    if (!isLoggedIn) return;
    const requestedId = featureIds.has(id) ? id : 'dashboard';
    const targetId = requestedId === 'admin-dashboard' && currentUser?.role !== 'Admin' ? 'dashboard' : requestedId;
    featureItems.forEach((item) => {
      const itemId = item.id || (item.classList.contains('hero') ? 'home' : '');
      item.hidden = itemId !== targetId;
      item.classList.toggle('feature-active', itemId === targetId);
    });
    document.body.classList.add('feature-mode');
    nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
    });
    if (updateHash && window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const syncFeatureView = () => {
    if (!isLoggedIn) {
      featureItems.forEach((item) => { item.hidden = false; item.classList.remove('feature-active'); });
      document.body.classList.remove('feature-mode');
      return;
    }
    const requested = window.location.hash.replace('#', '').trim();
    if (requested === 'login' || requested === 'register') {
      showFeature(pendingFeature || 'dashboard', false);
      return;
    }
    showFeature(requested || 'dashboard', false);
  };

  window.addEventListener('hashchange', () => {
    const requested = window.location.hash.replace('#', '').trim();
    if (requested === 'login') { openLogin(); return; }
    if (requested === 'register') { openRegister(); return; }
    if (isLoggedIn && requested) showFeature(requested, false);
  });

  const updateAuthUI = () => {
    if (!authButton) return;
    authButton.textContent = isLoggedIn ? 'Logout' : 'Login';
    authButton.classList.toggle('logout', isLoggedIn);
    if (isLoggedIn) {
      authButton.removeAttribute('href');
      authButton.setAttribute('data-auth', 'logout');
    } else {
      authButton.setAttribute('href', '#login');
      authButton.setAttribute('data-auth', 'login');
    }
    if (dashboardWelcome) {
      dashboardWelcome.textContent = isLoggedIn ? `Welcome, ${profile.name}` : 'Welcome, Guest';
    }
    if (authStatusPill) {
      authStatusPill.textContent = isLoggedIn ? currentRole : 'Demo';
    }
    body.classList.toggle('auth-required', !isLoggedIn);
  };

  const openLogin = (event) => {
    if (event) event.preventDefault();
    body.classList.remove('registering');
    registerModal?.classList.remove('open');
    loginStatus.textContent = '';
    loginStatus.classList.remove('error');
    loginModal.classList.add('open');
  };

  const closeLogin = () => {
    loginModal.classList.remove('open');
  };

  const openRegister = (event) => {
    if (event) event.preventDefault();
    body.classList.add('registering');
    loginModal.classList.remove('open');
    if (registerStatus) {
      registerStatus.textContent = '';
      registerStatus.classList.remove('error');
    }
    registerModal?.classList.add('open');
  };

  const closeRegister = () => {
    body.classList.remove('registering');
    registerModal?.classList.remove('open');
    openLogin();
  };

  // sessionStorage is intentionally used for authentication. Browsers clear it when the tab/window session ends,
  // while refreshes and in-app navigation keep the user signed in. Do not use pagehide here because it also fires on reload.

  const logout = () => {
    isLoggedIn = false;
    currentUser = null;
    currentRole = 'Guest';
    sessionStorage.removeItem('rtd-current-user');
    sessionStorage.removeItem('rtd-token');
    sessionStorage.removeItem('rtd-pending-feature');
    sessionStorage.setItem('rtd-demo-auth', 'false');
    sessionStorage.setItem('rtd-demo-role', currentRole);
    updateAuthUI();
    syncFeatureView();
    openLogin();
    loginStatus.textContent = 'You have been logged out.';
    loginStatus.classList.remove('error');
  };

  authButton.addEventListener('click', (event) => {
    if (isLoggedIn) {
      event.preventDefault();
      logout();
    } else {
      openLogin(event);
    }
  });

  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    logout();
  });

  const handleNavToggle = () => {
    nav.classList.toggle('open');
    menuToggle.classList.toggle('open');
  };

  menuToggle.addEventListener('click', handleNavToggle);
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('open');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const id = targetId.slice(1);
      if (id === 'login') { event.preventDefault(); openLogin(event); return; }
      if (id === 'register') { event.preventDefault(); openRegister(event); return; }
      if (!featureIds.has(id)) return;
      event.preventDefault();
      if (!isLoggedIn) { pendingFeature = id; sessionStorage.setItem('rtd-pending-feature', id); openLogin(); return; }
      showFeature(id);
      nav?.querySelectorAll('a[href^="#"]').forEach((navLink) => navLink.classList.toggle('active', navLink === link));
    });
  });

  themeToggle.addEventListener('click', () => {
    applyTheme(body.classList.contains('light') ? 'dark' : 'light');
  });

  settingsThemeToggle && settingsThemeToggle.addEventListener('click', () => {
    applyTheme(body.classList.contains('light') ? 'dark' : 'light');
  });

  const typeHeading = () => {
    const heading = document.querySelector('.hero h1');
    if (!heading) return;
    const text = heading.textContent.trim();
    heading.textContent = '';
    let index = 0;
    const tick = () => {
      heading.textContent = text.slice(0, index);
      index += 1;
      if (index <= text.length) {
        setTimeout(tick, 45);
      }
    };
    setTimeout(tick, 300);
  };
  typeHeading();

  window.addEventListener('scroll', () => {
    topbar.classList.toggle('scrolled', window.scrollY > 30);
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const revealElements = document.querySelectorAll('.card, .section-heading, .hero-content, .hero-metrics > div, .stat-card, .feature-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealElements.forEach((element) => {
    element.classList.add('reveal');
    revealObserver.observe(element);
  });

  const counters = document.querySelectorAll('.stat-card p');
  counters.forEach((counter) => {
    const raw = counter.textContent.trim();
    const match = raw.match(/([\d.]+)/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const suffix = raw.replace(match[1], '').trim();
    counter.textContent = '0';
    counter.dataset.target = String(target);
    counter.dataset.suffix = suffix;
  });

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = parseFloat(counter.dataset.target || '0');
      const suffix = counter.dataset.suffix || '';
      let current = 0;
      const duration = 1400;
      const stepTime = 16;
      const steps = duration / stepTime;
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = `${target}${suffix}`;
          clearInterval(timer);
        } else {
          counter.textContent = `${current.toFixed(target % 1 === 0 ? 0 : 1)}${suffix}`;
        }
      }, stepTime);
    });
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const analyticsSection = document.querySelector('#analytics');
  if (analyticsSection) counterObserver.observe(analyticsSection);

  const liveClockDisplay = document.getElementById('live-clock-display');
  const lastUpdateLabel = document.getElementById('last-update');
  const dashboardState = {
    users: 184,
    records: 245000,
    uptime: 99.9,
    cloud: 'Stable',
    speed: 4.2,
    network: 318,
    throughput: 182,
    latency: 48,
    alertLevel: 'Low',
    sync: 98,
    signal: 92,
    processing: 24,
    weatherTemp: 24,
    weatherHumidity: 58,
    weatherWind: 14,
    weatherPressure: 1012,
    weatherCondition: 'Clear'
  };

  const updateClock = () => {
    const now = new Date();
    if (liveClockDisplay) {
      liveClockDisplay.innerHTML = `<strong>${now.toLocaleTimeString()}</strong><div>${now.toDateString()}</div>`;
    }
    if (clock) {
      clock.innerHTML = `<strong>${now.toLocaleTimeString()}</strong><span>${now.toLocaleDateString()}</span>`;
    }
  };

  const activityItems = [
    'Data pipeline synced successfully',
    'Latency spike detected in channel A',
    'Cloud backup completed',
    'Notification preferences updated'
  ];
  const notificationItems = [
    'New data processed',
    'System status normal',
    'Performance warning reviewed',
    'Report generated'
  ];

  const renderActivity = () => {
    if (dashboardActivity) {
      dashboardActivity.innerHTML = activityItems.map((item) => `<li>${item}</li>`).join('');
    }
    if (dashboardNotifications) {
      dashboardNotifications.innerHTML = notificationItems.map((item) => `<li>${item}</li>`).join('');
    }
    const modernActivity = document.getElementById('reference-activity');
    if (modernActivity) {
      const icons = ['⌁', '▣', '✓', '△'];
      modernActivity.innerHTML = activityItems.slice(0, 4).map((item, index) => `<div><span>${icons[index]}</span><p><strong>${item}</strong><small>${index === 0 ? 'Just now' : `${(index + 1) * 3} minutes ago`}</small></p></div>`).join('');
    }
  };

  let updateDashboardMetrics = () => {
    dashboardState.users = Math.max(160, Math.min(220, dashboardState.users + (Math.random() > 0.5 ? 3 : -2)));
    dashboardState.records = Math.min(320000, dashboardState.records + Math.floor(Math.random() * 1200 + 700));
    dashboardState.uptime = Number((99.8 + Math.random() * 0.2).toFixed(1));
    dashboardState.cloud = dashboardState.uptime > 99.85 ? 'Stable' : 'Watch';
    dashboardState.speed = Number((dashboardState.speed + (Math.random() > 0.5 ? 0.05 : -0.03)).toFixed(1));
    dashboardState.network = Math.max(280, Math.min(360, dashboardState.network + Math.floor(Math.random() * 14 - 7)));
    dashboardState.throughput = Math.max(150, Math.min(220, dashboardState.throughput + (Math.random() > 0.5 ? 4 : -3)));
    dashboardState.latency = Math.max(32, Math.min(70, dashboardState.latency + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.alertLevel = dashboardState.latency > 58 ? 'High' : dashboardState.latency > 44 ? 'Medium' : 'Low';
    dashboardState.sync = Math.max(92, Math.min(100, dashboardState.sync + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.signal = Math.max(84, Math.min(98, dashboardState.signal + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.processing = Math.max(18, Math.min(36, dashboardState.processing + (Math.random() > 0.5 ? 2 : -1)));
    dashboardState.weatherTemp = Math.max(18, Math.min(31, dashboardState.weatherTemp + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.weatherHumidity = Math.max(45, Math.min(82, dashboardState.weatherHumidity + (Math.random() > 0.5 ? 2 : -2)));
    dashboardState.weatherWind = Math.max(8, Math.min(26, dashboardState.weatherWind + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.weatherPressure = Math.max(1002, Math.min(1022, dashboardState.weatherPressure + (Math.random() > 0.5 ? 1 : -1)));
    dashboardState.weatherCondition = dashboardState.weatherHumidity > 75 ? 'Rain' : 'Clear';

    document.getElementById('metric-users').textContent = `${Math.round(dashboardState.users)}`;
    document.getElementById('metric-records').textContent = `${dashboardState.records.toLocaleString()}`;
    document.getElementById('metric-uptime').textContent = `${dashboardState.uptime.toFixed(1)}%`;
    document.getElementById('metric-cloud').textContent = dashboardState.cloud;
    document.getElementById('metric-speed').textContent = `${dashboardState.speed.toFixed(1)}x`;
    document.getElementById('metric-network').textContent = `${dashboardState.network} Mbps`;

    document.getElementById('sensor-temperature').textContent = `${dashboardState.throughput} Mbps`;
    document.getElementById('sensor-humidity').textContent = `${dashboardState.latency} ms`;
    document.getElementById('sensor-air-quality').textContent = dashboardState.alertLevel;
    document.getElementById('sensor-rain').textContent = `${dashboardState.processing}%`;
    document.getElementById('sensor-soil').textContent = `${dashboardState.sync}%`;
    document.getElementById('sensor-light').textContent = `${dashboardState.signal}%`;
    document.getElementById('sensor-energy').textContent = `${dashboardState.speed.toFixed(1)}x`;
    document.getElementById('sensor-device-status').textContent = dashboardState.cloud;

    document.getElementById('weather-temp').textContent = `${dashboardState.weatherTemp}°C`;
    document.getElementById('weather-condition').textContent = dashboardState.weatherCondition;
    document.getElementById('weather-humidity').textContent = `${dashboardState.weatherHumidity}%`;
    document.getElementById('weather-wind').textContent = `${dashboardState.weatherWind} km/h`;
    document.getElementById('weather-pressure').textContent = `${dashboardState.weatherPressure} hPa`;

    // Modern reference dashboard bindings: keep the new visual dashboard live without
    // disturbing the existing data engine and backend integration.
    const setModern = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    const score = Math.max(72, Math.min(99, Math.round(100 - dashboardState.latency * 0.18 + dashboardState.sync * 0.08)));
    setModern('modern-stream-count', Math.round(dashboardState.users / 7.7));
    setModern('modern-live-metrics', Math.round(dashboardState.records / 28.7).toLocaleString());
    setModern('modern-data-processed', `${(dashboardState.records / 100000).toFixed(2)} TB`);
    setModern('modern-cloud-capacity', `${Math.max(55, Math.min(92, Math.round(62 + dashboardState.processing * 0.25)))}%`);
    setModern('modern-uptime', `${dashboardState.uptime.toFixed(2)}%`);
    setModern('modern-performance-score', `${score}%`);
    setModern('modern-flow-value', `${dashboardState.throughput} Mbps`);
    setModern('modern-load-value', `${Math.round(dashboardState.processing * 2.1)}%`);
    setModern('modern-stream-throughput', `${dashboardState.throughput} Mbps`);
    setModern('modern-stream-latency', `${dashboardState.latency} ms`);
    const modernTime = document.getElementById('reference-time');
    const modernDate = document.getElementById('reference-date');
    const modernDay = document.getElementById('reference-day');
    const nowForModern = new Date();
    if (modernTime) modernTime.textContent = nowForModern.toLocaleTimeString();
    if (modernDate) modernDate.textContent = nowForModern.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
    if (modernDay) modernDay.textContent = nowForModern.toLocaleDateString(undefined, { weekday: 'long' });

    const nextActivity = [
      `New data batch processed at ${new Date().toLocaleTimeString()}`,
      `Cloud sync updated with ${dashboardState.network} Mbps traffic`,
      `Alert threshold reviewed for ${dashboardState.alertLevel.toLowerCase()} priority`,
      `Report export queued for analytics review`
    ][Math.floor(Math.random() * 4)];
    const nextNotification = [
      'System status remains healthy',
      'Performance warning reviewed',
      'Cloud synchronization completed',
      'Daily report generated successfully'
    ][Math.floor(Math.random() * 4)];

    activityItems.unshift(nextActivity);
    activityItems.pop();
    notificationItems.unshift(nextNotification);
    notificationItems.pop();
    renderActivity();

    if (lastUpdateLabel) {
      lastUpdateLabel.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    }

    if (window.chartState) {
      window.chartState.line.push(dashboardState.throughput);
      window.chartState.line.shift();
      window.chartState.bar[0] = Math.max(60, dashboardState.sync);
      window.chartState.bar[1] = Math.max(60, dashboardState.throughput / 2);
      window.chartState.bar[2] = Math.max(60, dashboardState.speed * 12);
      window.chartState.bar[3] = Math.max(60, dashboardState.network / 4);
      window.chartState.weekly.push(dashboardState.signal);
      window.chartState.weekly.shift();
      window.chartState.monthly.push(Math.round(dashboardState.uptime * 10));
      window.chartState.monthly.shift();
      window.chartState.doughnut = [Math.max(10, dashboardState.sync), Math.max(10, dashboardState.network / 25), Math.max(10, dashboardState.speed * 6)];
      updateCharts();
    }
  };

  updateClock();
  updateDashboardMetrics();
  setInterval(updateClock, 1000);
  let dashboardRefreshTimer = window.setInterval(updateDashboardMetrics, 4000);

  const defaultNotifications = [
    { title: 'New data received', message: 'A fresh batch of analytics records arrived.', unread: true, category: 'Data' },
    { title: 'Cloud synchronization completed', message: 'Cloud sync completed successfully.', unread: true, category: 'System' },
    { title: 'Performance warning', message: 'System load remains healthy but needs monitoring.', unread: false, category: 'System' },
    { title: 'Report generated', message: 'A new report is available for review.', unread: true, category: 'Report' }
  ];
  let notifications = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rtd-notification-history'));
      return Array.isArray(saved) && saved.length ? saved : defaultNotifications;
    } catch {
      return defaultNotifications;
    }
  })();

  const saveNotifications = () => localStorage.setItem('rtd-notification-history', JSON.stringify(notifications));

  const renderNotificationsPanel = () => {
    if (!notificationList) return;
    notificationList.innerHTML = '';
    notifications.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = `notification-item ${item.unread ? 'unread' : ''}`;
      row.innerHTML = `<div><strong>${item.title}</strong><div>${item.message}</div><div class="subtle">${item.category}</div></div><button data-index="${index}">Mark</button>`;
      notificationList.appendChild(row);
    });
    const unreadCount = notifications.filter((item) => item.unread).length;
    notificationBadge.textContent = unreadCount;
    if (notificationCounterPill) {
      notificationCounterPill.textContent = `${unreadCount} new`;
    }
    if (notificationHistory) {
      notificationHistory.innerHTML = notifications.slice(0, 3).map((item) => `<div class="history-item">${item.title} • ${item.category}</div>`).join('');
    }
    saveNotifications();
  };

  const toggleNotifications = () => {
    notificationPanel.classList.toggle('open');
  };

  notificationToggle && notificationToggle.addEventListener('click', toggleNotifications);
  document.querySelector('.panel-close')?.addEventListener('click', toggleNotifications);
  notificationList?.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const index = Number(button.dataset.index);
    notifications[index].unread = false;
    renderNotificationsPanel();
  });
  markAllReadButton?.addEventListener('click', () => {
    notifications.forEach((item) => {
      item.unread = false;
    });
    renderNotificationsPanel();
  });
  clearAllNotificationsButton?.addEventListener('click', () => {
    notifications.splice(0, notifications.length, { title: 'Notifications cleared', message: 'The panel has been reset for a fresh review.', unread: false, category: 'System' });
    renderNotificationsPanel();
  });
  renderNotificationsPanel();

  const showNotification = (title, message) => {
    const note = document.createElement('div');
    note.className = 'notification';
    note.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    notificationStack.appendChild(note);
    setTimeout(() => note.classList.add('show'), 50);
    setTimeout(() => {
      note.classList.remove('show');
      setTimeout(() => note.remove(), 400);
    }, 3800);
  };

  const notificationQueue = [
    ['New data processed', 'A new batch of analytics records is ready.'],
    ['System status', 'Cloud synchronization is healthy.'],
    ['Performance warning', 'Processing speed has slightly improved.'],
    ['Report generated', 'Daily analytics report has been prepared.']
  ];

  let notificationIndex = 0;
  setInterval(() => {
    if (settingsNotifications?.checked === false) return;
    const [title, message] = notificationQueue[notificationIndex % notificationQueue.length];
    showNotification(title, message);
    notificationIndex += 1;
  }, 4500);

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) closeLogin();
  });

  document.querySelector('.modal-close')?.addEventListener('click', closeLogin);

  passwordToggle?.addEventListener('click', () => {
    const isPassword = passwordField.type === 'password';
    passwordField.type = isPassword ? 'text' : 'password';
    passwordToggle.textContent = isPassword ? 'Hide' : 'Show';
  });

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const identity = identityField.value.trim().toLowerCase();
    const password = passwordField.value;

    if (!identity || !password) {
      loginStatus.textContent = 'Please enter your username/email and password.';
      loginStatus.classList.add('error');
      return;
    }

    const account = registeredUsers.find(
      (user) => user.username.toLowerCase() === identity || user.email.toLowerCase() === identity
    );

    if (!account || account.password !== password) {
      loginStatus.textContent = 'Invalid username/email or password. Please register first.';
      loginStatus.classList.add('error');
      return;
    }

    currentUser = account;
    isLoggedIn = true;
    currentRole = account.role;

    profile = {
      name: account.name,
      email: account.email,
      role: account.role === 'Admin' ? 'Project Administrator' : 'Registered Viewer'
    };

    sessionStorage.setItem('rtd-current-user', JSON.stringify(account));
    sessionStorage.setItem('rtd-demo-auth', 'true');
    sessionStorage.setItem('rtd-demo-role', currentRole);
    sessionStorage.setItem('rtd-profile', JSON.stringify(profile));

    updateAuthUI();
    const destination = pendingFeature || sessionStorage.getItem('rtd-pending-feature') || 'dashboard';
    pendingFeature = null;
    sessionStorage.removeItem('rtd-pending-feature');
    showFeature(destination);
    renderProfile?.();

    loginStatus.textContent = `Login successful. Welcome, ${account.name}!`;
    loginStatus.classList.remove('error');

    setTimeout(() => {
      closeLogin();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  });

  // Registration creates the real browser-stored account used by the login form.
  registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('register-name')?.value.trim() || '';
    const email = document.getElementById('register-email')?.value.trim().toLowerCase() || '';
    const username = document.getElementById('register-username')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('register-password')?.value || '';
    const confirmPassword = document.getElementById('register-confirm-password')?.value || '';

    const setRegisterError = (message) => {
      if (!registerStatus) return;
      registerStatus.textContent = message;
      registerStatus.classList.add('error');
    };

    if (!name || !email || !username || !password || !confirmPassword) {
      setRegisterError('Please fill in every field.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegisterError('Please enter a valid email address.');
      return;
    }

    if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
      setRegisterError('Username must be 3–20 characters and use letters, numbers, dot, underscore, or hyphen.');
      return;
    }

    if (password.length < 4) {
      setRegisterError('Password must contain at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    if (registeredUsers.some((user) => user.username.toLowerCase() === username)) {
      setRegisterError('That username is already registered.');
      return;
    }

    if (registeredUsers.some((user) => user.email.toLowerCase() === email)) {
      setRegisterError('That email is already registered.');
      return;
    }

    const account = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      username,
      password,
      role: 'Viewer',
      createdAt: new Date().toISOString()
    };

    registeredUsers.push(account);
    localStorage.setItem('rtd-registered-users', JSON.stringify(registeredUsers));

    registerStatus.textContent =
      'Registration successful. Viewer access was assigned. Please log in with your new account.';
    registerStatus.classList.remove('error');

    registerForm.reset();

    setTimeout(() => {
      openLogin();
      identityField.value = account.username;
      passwordField.value = '';
      loginStatus.textContent = 'Account created. Enter your password to log in.';
      loginStatus.classList.remove('error');
    }, 900);
  });

  document.getElementById('open-register')?.addEventListener('click', openRegister);
  document.getElementById('open-login')?.addEventListener('click', openLogin);
  document.getElementById('register-close')?.addEventListener('click', closeRegister);

  registerModal?.addEventListener('click', (event) => {
    if (event.target === registerModal && !document.body.classList.contains('auth-required')) {
      closeRegister();
    }
  });

  updateAuthUI();
  syncFeatureView();

  // Role-aware access: Admins get management controls; registered Viewers get a personal dashboard.
  const userDashboard = document.getElementById('user-dashboard');
  const userDashboardTitle = document.getElementById('user-dashboard-title');
  const userDashboardSubtitle = document.getElementById('user-dashboard-subtitle');
  const userRolePill = document.getElementById('user-role-pill');
  const userAccountName = document.getElementById('user-account-name');
  const userAccountUsername = document.getElementById('user-account-username');
  const userAccountEmail = document.getElementById('user-account-email');
  const userFeatureAccess = document.getElementById('user-feature-access');
  const userActivityList = document.getElementById('user-activity-list');
  const adminDashboardSection = document.getElementById('admin-dashboard');

  const viewerFeatures = [
    ['✓', 'Live Dashboard', 'Available'],
    ['✓', 'Analytics', 'Available'],
    ['✓', 'Reports', 'Available'],
    ['✓', 'Data Streams', 'Available'],
    ['✓', 'Notifications', 'Available'],
    ['✓', 'Personal Profile', 'Available'],
    ['🔒', 'User Management', 'Admin only'],
    ['🔒', 'Data Stream Editor', 'Admin only'],
    ['🔒', 'Alert Rule Management', 'Admin only'],
    ['🔒', 'Demo Data Import', 'Admin only']
  ];

  const renderRoleDashboard = () => {
    const isAdminUser = Boolean(isLoggedIn && currentUser && currentUser.role === 'Admin');
    const isViewerUser = Boolean(isLoggedIn && currentUser && currentUser.role === 'Viewer');

    document.body.classList.toggle('role-user-mode', isAdminUser);
    document.body.classList.toggle('role-viewer-mode', isViewerUser);

    if (userDashboard) userDashboard.hidden = !isViewerUser;

    if (isViewerUser) {
      userDashboardTitle.textContent = `Welcome, ${currentUser.name}`;
      userDashboardSubtitle.textContent = 'You are signed in as a registered Viewer. Only your permitted project features are available.';
      userRolePill.textContent = currentUser.role;
      userAccountName.textContent = currentUser.name;
      userAccountUsername.textContent = `@${currentUser.username}`;
      userAccountEmail.textContent = currentUser.email;

      userFeatureAccess.innerHTML = viewerFeatures.map(([icon, name, state]) => `
        <div class="feature-access-item">
          <span class="access-icon">${icon}</span>
          <span class="access-name">${name}</span>
          <span class="access-state">${state}</span>
        </div>
      `).join('');

      if (userActivityList) {
        userActivityList.innerHTML = `
          <li>Signed in as ${currentUser.username}</li>
          <li>Personal account verified</li>
          <li>Viewer permissions applied</li>
        `;
      }
    }

    // Admins keep the existing control center; normal viewers never get admin controls.
    if (adminDashboardSection) {
      adminDashboardSection.hidden = !isAdminUser;
    }

    if (isViewerUser) {
      document.querySelectorAll('a[href="#admin-dashboard"], .hero-actions a[href="#admin-dashboard"]').forEach((link) => {
        link.style.display = 'none';
      });
    } else {
      document.querySelectorAll('a[href="#admin-dashboard"], .hero-actions a[href="#admin-dashboard"]').forEach((link) => {
        link.style.display = '';
      });
    }
  };

  renderRoleDashboard();

  const refreshRoleUI = () => {
    renderRoleDashboard();
    if (typeof applyRoleAccess === 'function') applyRoleAccess();
  };

  // Refresh after login/logout without creating another authentication system.
  loginForm?.addEventListener('submit', () => setTimeout(refreshRoleUI, 600));
  logoutButton?.addEventListener('click', () => setTimeout(refreshRoleUI, 50));

  const addChatMessage = (message, type = 'bot') => {
    const container = chatbotPanel.querySelector('.chatbot-messages');
    const bubble = document.createElement('div');
    bubble.className = `chatbot-bubble ${type}`;
    bubble.textContent = message;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  };

  const getBotReply = (input) => {
    const value = input.toLowerCase();
    if (value.includes('project')) return 'This is a demo AI assistant for the Real-Time Data & Modern Tech project.';
    if (value.includes('dashboard')) return 'The dashboard shows live metrics, health status, and active users in one place.';
    if (value.includes('analytics')) return 'The analytics view highlights activity, performance, and reporting trends.';
    if (value.includes('report')) return 'Daily, weekly, and monthly reports are available for export as CSV files.';
    if (value.includes('status')) return 'The platform is running in demo mode with simulated, real-time updates.';
    return 'I am a demo assistant. I can explain the dashboard, analytics, reports, and system status.';
  };

  chatbotToggle.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  chatbotPanel.querySelector('.chatbot-close').addEventListener('click', () => {
    chatbotPanel.classList.remove('open');
  });

  chatbotPanel.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const query = button.getAttribute('data-action');
      addChatMessage(query, 'user');
      addChatMessage(getBotReply(query), 'bot');
    });
  });

  const sendButton = chatbotPanel.querySelector('.chatbot-send');
  const chatInput = chatbotPanel.querySelector('.chatbot-input-row input');
  const sendChat = () => {
    const value = chatInput.value.trim();
    if (!value) return;
    addChatMessage(value, 'user');
    addChatMessage(getBotReply(value), 'bot');
    chatInput.value = '';
  };

  sendButton.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendChat();
  });
  addChatMessage('Hello! I am a demo assistant for this project. I can explain analytics, reports, and system status.', 'bot');

  // Keep the server-rendered Overall Performance markup intact.
  const chartCard = document.querySelector('.chart-card');

  const drawFallbackChart = (canvas, data, mode = 'line', label = '') => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || 640));
    const height = Math.max(180, Math.round(rect.height || 240));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(148,163,184,.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i += 1) {
      const y = (height - 40) * (i / 5) + 10;
      ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(width - 16, y); ctx.stroke();
    }
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = Math.max(1, max - min);
    const values = data.map(Number);
    ctx.strokeStyle = '#4fc3f7';
    ctx.fillStyle = 'rgba(79,195,247,.12)';
    ctx.lineWidth = 3;
    if (mode === 'bar') {
      const gap = 12;
      const barWidth = Math.max(16, (width - 60 - gap * (values.length - 1)) / values.length);
      values.forEach((v, i) => {
        const h = ((v - min) / range) * (height - 70);
        const x = 36 + i * (barWidth + gap);
        const y = height - 28 - h;
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(x, y, barWidth, h);
      });
    } else if (mode === 'doughnut') {
      const total = values.reduce((a, b) => a + b, 0) || 1;
      let start = -Math.PI / 2;
      const colors = ['#4fc3f7', '#8b5cf6', '#38bdf8'];
      values.forEach((v, i) => {
        const end = start + (v / total) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(width/2, height/2); ctx.arc(width/2, height/2, Math.min(width,height)*.32, start, end); ctx.closePath();
        ctx.fillStyle = colors[i % colors.length]; ctx.fill(); start = end;
      });
      ctx.beginPath(); ctx.fillStyle = '#0f172a'; ctx.arc(width/2, height/2, Math.min(width,height)*.18, 0, Math.PI*2); ctx.fill();
    } else {
      values.forEach((v, i) => {
        const x = 36 + (i * (width - 56)) / Math.max(1, values.length - 1);
        const y = height - 28 - ((v - min) / range) * (height - 70);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        ctx.fillStyle = '#4fc3f7';
      });
      ctx.stroke();
      ctx.fillStyle = '#4fc3f7';
      values.forEach((v, i) => {
        const x = 36 + (i * (width - 56)) / Math.max(1, values.length - 1);
        const y = height - 28 - ((v - min) / range) * (height - 70);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      });
    }
    if (label) { ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif'; ctx.fillText(label, 12, height - 8); }
  };

  const insightTemplates = [
    { title: 'Performance is improving', detail: 'Throughput is up 8.2% over last week.', confidence: '92%' },
    { title: 'Data processing increased', detail: 'Processing throughput accelerated while latency stayed stable.', confidence: '88%' },
    { title: 'System performance is stable', detail: 'Cloud synchronization remained healthy throughout the last cycle.', confidence: '95%' },
    { title: 'Unusual activity detected', detail: 'A short burst of traffic was flagged and reviewed automatically.', confidence: '78%' },
    { title: 'Cloud synchronization is healthy', detail: 'Current sync health remains above the target threshold.', confidence: '94%' }
  ];

  const ensureNoEmptyPanels = () => {
    if (insightsContainer && !insightsContainer.textContent.trim()) renderInsights();
    if (notificationList && !notificationList.textContent.trim()) {
      notificationList.innerHTML = '<div class="history-item">System monitoring is active.</div><div class="history-item">No critical alerts at startup.</div>';
    }
    if (dashboardActivity && !dashboardActivity.textContent.trim()) {
      dashboardActivity.innerHTML = '<li>System initialized successfully.</li><li>Real-time metrics are updating.</li>';
    }
    if (dashboardNotifications && !dashboardNotifications.textContent.trim()) {
      dashboardNotifications.innerHTML = '<li>No critical alerts.</li><li>All services are operating normally.</li>';
    }
    if (document.getElementById('activity-feed') && !document.getElementById('activity-feed').textContent.trim()) {
      document.getElementById('activity-feed').innerHTML = '<div class="feed-item"><span class="feed-dot"></span><div><strong>System started</strong><div class="subtle">Live activity feed is ready.</div></div></div>';
    }
  };

  const renderInsights = () => {
    if (!insightsContainer) return;
    insightsContainer.innerHTML = insightTemplates.map((item) => `
      <div class="insight-item">
        <div>
          <strong>${item.title}</strong>
          <div class="subtle">${item.detail}</div>
        </div>
        <span class="confidence">Confidence ${item.confidence}</span>
      </div>
    `).join('');
  };

  const refreshInsights = () => {
    const nextSet = [...insightTemplates].sort(() => 0.5 - Math.random()).slice(0, 4);
    insightTemplates.splice(0, insightTemplates.length, ...nextSet);
    renderInsights();
    const recommendationPool = [
      'Keep monitoring the throughput trend and preserve current cloud health.',
      'Prioritize the daily report export queue during the next cycle.',
      'Retain the current sync frequency and review the alert threshold.',
      'Prepare a backup snapshot before the next automated processing window.'
    ];
    if (recommendationText) {
      recommendationText.textContent = recommendationPool[Math.floor(Math.random() * recommendationPool.length)];
    }
  };

  refreshInsightsButton?.addEventListener('click', refreshInsights);
  renderInsights();

  const activityFeed = document.getElementById('activity-feed');
  const feedEvents = [
    { icon: '🟢', title: '10:32:15', detail: 'New data received' },
    { icon: '🟣', title: '10:32:21', detail: 'Analytics updated' },
    { icon: '🔵', title: '10:32:28', detail: 'Report generated' },
    { icon: '🟡', title: '10:32:35', detail: 'Cloud synchronization completed' }
  ];

  const renderFeed = () => {
    if (!activityFeed) return;
    activityFeed.innerHTML = feedEvents.map((item) => `
      <div class="feed-item">
        <span class="feed-dot">${item.icon}</span>
        <div>
          <strong>${item.title}</strong>
          <div class="subtle">${item.detail}</div>
        </div>
      </div>
    `).join('');
  };
  renderFeed();

  setInterval(() => {
    const nextEvent = [
      { icon: '🟢', title: new Date().toLocaleTimeString(), detail: 'New data received' },
      { icon: '🟣', title: new Date().toLocaleTimeString(), detail: 'Analytics updated' },
      { icon: '🔵', title: new Date().toLocaleTimeString(), detail: 'Report generated' },
      { icon: '🟡', title: new Date().toLocaleTimeString(), detail: 'Cloud synchronization completed' }
    ][Math.floor(Math.random() * 4)];
    feedEvents.unshift(nextEvent);
    feedEvents.pop();
    renderFeed();
  }, 5000);

  const comparisonData = {
    day: { change: '+14.8%', trend: 'Increase', labels: ['Yesterday', 'Today'], values: [72, 82] },
    week: { change: '+11.2%', trend: 'Increase', labels: ['Last Week', 'This Week'], values: [68, 76] },
    month: { change: '-3.1%', trend: 'Decrease', labels: ['Previous Month', 'This Month'], values: [91, 88] }
  };

  const renderComparisonChart = () => {
    const selectedRange = comparisonRange?.value || 'week';
    const selected = comparisonData[selectedRange] || comparisonData.week;
    if (comparisonChange) comparisonChange.textContent = selected.change;
    if (comparisonTrend) comparisonTrend.textContent = selected.trend;
    const svg = document.getElementById('comparison-svg');
    const barA = document.getElementById('comparison-bar-a');
    const barB = document.getElementById('comparison-bar-b');
    const labelA = document.getElementById('comparison-label-a');
    const labelB = document.getElementById('comparison-label-b');
    if (!svg || !barA || !barB) return;
    const max = Math.max(...selected.values, 1);
    const baseY = 205;
    const maxHeight = 165;
    const scale = maxHeight / max;
    const hA = Math.max(18, selected.values[0] * scale);
    const hB = Math.max(18, selected.values[1] * scale);
    barA.setAttribute('y', String(baseY - hA));
    barA.setAttribute('height', String(hA));
    barB.setAttribute('y', String(baseY - hB));
    barB.setAttribute('height', String(hB));
    if (labelA) labelA.textContent = selected.labels[0];
    if (labelB) labelB.textContent = selected.labels[1];
  };
  comparisonRange?.addEventListener('change', renderComparisonChart);
  renderComparisonChart();

  const reportData = {
    daily: { title: 'Daily Report', summary: 'Daily performance remained strong with a 9% increase in data processing.' },
    weekly: { title: 'Weekly Report', summary: 'Weekly throughput exceeded target and remained stable across all cloud nodes.' },
    monthly: { title: 'Monthly Report', summary: 'Monthly analytics show dependable growth and strong efficiency.' },
    summary: { title: 'Analytics Summary', summary: 'Platform health is healthy with strong throughput and low alert risk.' }
  };

  document.querySelectorAll('.export-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const report = button.dataset.report;
      const payload = reportData[report] || reportData.summary;
      reportSummary.textContent = `${payload.title}: ${payload.summary}`;
      if (button.textContent.includes('CSV') || report === 'summary') {
        const rows = [['Report Type', 'Status', 'Summary'], [payload.title, 'Demo', payload.summary]];
        const csv = rows.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report}-report.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
      if (button.textContent.includes('Print')) {
        window.print();
      }
    });
  });

  const indexContent = [
    { title: 'Reports', type: 'Reports', description: 'Daily, weekly, monthly, and analytics summary reports' },
    { title: 'Analytics', type: 'Analytics', description: 'Advanced performance and trend dashboards' },
    { title: 'Activities', type: 'Activities', description: 'Real-time feed of simulated platform activity' },
    { title: 'Notifications', type: 'Notifications', description: 'Smart notifications and notification history' },
    { title: 'Users', type: 'Users', description: 'Admin profile and user management context' },
    { title: 'Settings', type: 'Settings', description: 'Theme, layout, and dashboard customization' }
  ];

  const updateSearchResults = () => {
    const value = globalSearchInput?.value.trim().toLowerCase() || '';
    if (!searchResults) return;
    if (!value) {
      searchResults.hidden = true;
      searchResults.innerHTML = '';
      return;
    }
    const matches = indexContent.filter((item) => `${item.title} ${item.type} ${item.description}`.toLowerCase().includes(value));
    if (!matches.length) {
      searchResults.hidden = false;
      searchResults.innerHTML = '<div>No results found</div>';
      return;
    }
    searchResults.hidden = false;
    searchResults.innerHTML = matches.slice(0, 5).map((item) => `<div><strong>${item.title}</strong><div class="subtle">${item.description}</div></div>`).join('');
  };

  globalSearchInput?.addEventListener('input', updateSearchResults);
  searchClear?.addEventListener('click', () => {
    if (globalSearchInput) {
      globalSearchInput.value = '';
      updateSearchResults();
    }
  });

  const contactForm = document.querySelector('.contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = contactForm.querySelector('input[type="text"]')?.value.trim();
    const email = contactForm.querySelector('input[type="email"]')?.value.trim();
    const subject = contactForm.querySelectorAll('input[type="text"]')[1]?.value.trim();
    const message = contactForm.querySelector('textarea')?.value.trim();
    if (!name || !email || !subject || !message) {
      showNotification('Message incomplete', 'Please fill in all contact fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Invalid email', 'Please enter a valid email address.');
      return;
    }
    const messages = JSON.parse(localStorage.getItem('rtd-contact-messages') || '[]');
    messages.unshift({ name, email, subject, message, createdAt: new Date().toISOString() });
    localStorage.setItem('rtd-contact-messages', JSON.stringify(messages.slice(0, 20)));
    contactForm.reset();
    showNotification('Message saved', 'Your enquiry has been saved for this frontend demo.');
  });

  const forgotPasswordLink = document.querySelector('.login-options a');
  forgotPasswordLink?.addEventListener('click', (event) => {
    event.preventDefault();
    if (loginStatus) {
      loginStatus.textContent = 'For this frontend demo, use admin/admin123 or viewer/viewer123.';
      loginStatus.classList.remove('error');
    }
  });

  const renderProfile = () => {
    const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NR';
    if (profileNameInput) profileNameInput.value = profile.name;
    if (profileEmailInput) profileEmailInput.value = profile.email;
    if (profileRoleInput) profileRoleInput.value = profile.role;
    if (profileDisplayName) profileDisplayName.textContent = profile.name;
    if (profileDisplayRole) profileDisplayRole.textContent = profile.role;
    if (profileDisplayEmail) profileDisplayEmail.textContent = profile.email;
    document.querySelectorAll('.profile-avatar').forEach((avatar) => { avatar.textContent = initials; });
    const settingsName = document.getElementById('settings-profile-name');
    const settingsEmail = document.getElementById('settings-profile-email');
    const settingsRole = document.getElementById('settings-profile-role');
    if (settingsName) settingsName.textContent = profile.name;
    if (settingsEmail) settingsEmail.textContent = profile.email;
    if (settingsRole) settingsRole.textContent = profile.role;
    updateAuthUI();
  };

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    profile = {
      name: profileNameInput.value.trim() || defaultProfile.name,
      email: profileEmailInput.value.trim() || defaultProfile.email,
      role: profileRoleInput.value.trim() || defaultProfile.role
    };
    sessionStorage.setItem('rtd-profile', JSON.stringify(profile));
    renderProfile();
    if (profileDisplayStatus) profileDisplayStatus.textContent = 'Active';
    if (profileDisplayLogin) profileDisplayLogin.textContent = 'Just updated';
    showNotification('Profile saved', 'Your administrator profile has been updated on this device.');
  });
  renderProfile();

  const applyAccent = (color) => {
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-2', color === '#4fc3f7' ? '#8b5cf6' : '#4fc3f7');
    localStorage.setItem('rtd-accent', color);
  };

  const savedAccent = localStorage.getItem('rtd-accent') || '#4fc3f7';
  applyAccent(savedAccent);
  if (accentColorSelect) {
    accentColorSelect.value = savedAccent;
    accentColorSelect.addEventListener('change', (event) => applyAccent(event.target.value));
  }

  const applyLayoutPreferences = () => {
    const compact = compactToggle?.checked;
    const comfortable = comfortableToggle?.checked;
    document.body.classList.toggle('compact-dashboard', compact && !comfortable);
    if (dashboardLayout) {
      document.body.classList.toggle('stack-layout', dashboardLayout.value === 'stack');
    }
    localStorage.setItem('rtd-layout', dashboardLayout ? dashboardLayout.value : 'grid');
    localStorage.setItem('rtd-compact', compact ? 'true' : 'false');
    localStorage.setItem('rtd-comfortable', comfortable ? 'true' : 'false');
  };

  compactToggle?.addEventListener('change', applyLayoutPreferences);
  comfortableToggle?.addEventListener('change', applyLayoutPreferences);
  dashboardLayout?.addEventListener('change', applyLayoutPreferences);
  resetDashboardButton?.addEventListener('click', () => {
    if (toggleKpi) toggleKpi.checked = true;
    if (toggleCharts) toggleCharts.checked = true;
    if (toggleFeed) toggleFeed.checked = true;
    if (dashboardLayout) dashboardLayout.value = 'grid';
    if (compactToggle) compactToggle.checked = false;
    if (comfortableToggle) comfortableToggle.checked = true;
    applyLayoutPreferences();
    syncDashboardToggles();
  });

  const savedLayout = localStorage.getItem('rtd-layout') || 'grid';
  const savedCompact = localStorage.getItem('rtd-compact') === 'true';
  const savedComfortable = localStorage.getItem('rtd-comfortable') !== 'false';
  const savedShowKpi = localStorage.getItem('rtd-show-kpi') !== 'false';
  const savedShowCharts = true;
  const savedShowFeed = localStorage.getItem('rtd-show-feed') !== 'false';
  if (dashboardLayout) dashboardLayout.value = savedLayout;
  if (compactToggle) compactToggle.checked = savedCompact;
  if (comfortableToggle) comfortableToggle.checked = savedComfortable;
  if (toggleKpi) toggleKpi.checked = savedShowKpi;
  if (toggleCharts) toggleCharts.checked = savedShowCharts;
  if (toggleFeed) toggleFeed.checked = savedShowFeed;
  applyLayoutPreferences();

  const syncDashboardToggles = () => {
    const kpiCards = document.querySelectorAll('.kpi-grid');
    const chartPanels = document.querySelectorAll('.analytics-chart-grid');
    const feedPanels = document.querySelectorAll('.activity-feed');
    kpiCards.forEach((card) => {
      card.style.display = toggleKpi?.checked === false ? 'none' : 'grid';
    });
    chartPanels.forEach((panel) => {
      panel.style.display = toggleCharts?.checked === false ? 'none' : 'grid';
    });
    feedPanels.forEach((panel) => {
      panel.style.display = toggleFeed?.checked === false ? 'none' : 'grid';
    });
    localStorage.setItem('rtd-show-kpi', toggleKpi?.checked ? 'true' : 'false');
    localStorage.setItem('rtd-show-charts', toggleCharts?.checked ? 'true' : 'false');
    localStorage.setItem('rtd-show-feed', toggleFeed?.checked ? 'true' : 'false');
  };
  toggleKpi?.addEventListener('change', syncDashboardToggles);
  toggleCharts?.addEventListener('change', syncDashboardToggles);
  toggleFeed?.addEventListener('change', syncDashboardToggles);
  syncDashboardToggles();

  const savedSettings = {
    notifications: localStorage.getItem('rtd-notifications') !== 'false',
    refresh: localStorage.getItem('rtd-refresh') !== 'false'
  };
  if (settingsNotifications) settingsNotifications.checked = savedSettings.notifications;
  if (settingsRefresh) settingsRefresh.checked = savedSettings.refresh;
  settingsNotifications?.addEventListener('change', () => {
    localStorage.setItem('rtd-notifications', settingsNotifications.checked ? 'true' : 'false');
  });
  settingsRefresh?.addEventListener('change', () => {
    localStorage.setItem('rtd-refresh', settingsRefresh.checked ? 'true' : 'false');
    if (settingsRefresh.checked && !dashboardRefreshTimer) {
      dashboardRefreshTimer = window.setInterval(updateDashboardMetrics, 4000);
      updateDashboardMetrics();
    }
    if (!settingsRefresh.checked && dashboardRefreshTimer) {
      window.clearInterval(dashboardRefreshTimer);
      dashboardRefreshTimer = null;
    }
  });
  if (!savedSettings.refresh && dashboardRefreshTimer) {
    window.clearInterval(dashboardRefreshTimer);
    dashboardRefreshTimer = null;
  }

  const defaultTeam = {
    guide: { name: 'BASAV SIR', role: 'Project Guide' },
    admin: { name: 'NAGENDRA REDDY', role: 'Project Administrator' },
    frontend: { name: 'JITHENDRA', role: 'Frontend Developer' },
    platform: { name: 'SAIKUMAR', role: 'Backend/Platform Developer' },
    analytics: { name: 'RAYHAN', role: 'Data & Analytics Developer' }
  };
  let team = readStored('rtd-team', defaultTeam);
  Object.keys(defaultTeam).forEach((key) => {
    team[key] = { ...defaultTeam[key], ...(team[key] || {}) };
  });
  const teamForm = document.getElementById('team-form');
  const teamMemberSelect = document.getElementById('team-member-select');
  const teamNameInput = document.getElementById('team-name-input');
  const teamRoleInput = document.getElementById('team-role-input');
  const resetTeamButton = document.getElementById('reset-team');
  const renderTeam = () => {
    Object.entries(team).forEach(([key, member]) => {
      const card = document.querySelector(`[data-team-id="${key}"]`);
      if (!card) return;
      const name = card.querySelector('h3');
      const role = card.querySelector('p');
      if (name) name.textContent = member.name;
      if (role) role.textContent = member.role;
    });
    const selected = teamMemberSelect?.value || 'guide';
    if (teamNameInput) teamNameInput.value = team[selected]?.name || '';
    if (teamRoleInput) teamRoleInput.value = team[selected]?.role || '';
  };
  teamMemberSelect?.addEventListener('change', renderTeam);
  teamForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = teamMemberSelect.value;
    team[selected] = {
      name: teamNameInput.value.trim() || defaultTeam[selected].name,
      role: teamRoleInput.value.trim() || defaultTeam[selected].role
    };
    localStorage.setItem('rtd-team', JSON.stringify(team));
    renderTeam();
    showNotification('Team member saved', `${team[selected].name}'s profile is updated for this demo.`);
  });
  resetTeamButton?.addEventListener('click', () => {
    team = JSON.parse(JSON.stringify(defaultTeam));
    localStorage.removeItem('rtd-team');
    renderTeam();
    showNotification('Team reset', 'The original project team has been restored.');
  });
  renderTeam();

  // Expanded presentation features: all browser-side and locally persisted.
  const isAdmin = () => isLoggedIn && currentRole === 'Admin';
  const featureHost = document.getElementById('features');
  featureHost?.insertAdjacentHTML('afterend', `
    <section id="technology-stack" class="section"><div class="section-heading"><p class="eyebrow">Technology Stack</p><h2>Built for a clear, modern college demonstration</h2></div><div class="card-grid technology-grid">
      <article class="card technology-card"><span>01</span><h3>HTML5</h3><p>Semantic structure for a reliable, accessible single-page platform.</p></article>
      <article class="card technology-card"><span>02</span><h3>CSS3</h3><p>Responsive glass panels, animations, grids, and dark/light themes.</p></article>
      <article class="card technology-card"><span>03</span><h3>JavaScript</h3><p>Live metrics, user actions, demo logic, and interactive controls.</p></article>
      <article class="card technology-card"><span>04</span><h3>Local Storage</h3><p>Browser-side persistence for custom profiles, settings, and demo data.</p></article>
      <article class="card technology-card"><span>05</span><h3>Chart.js</h3><p>Interactive visual analytics for data flow and performance trends.</p></article>
    </div></section>`);

  const streamSection = document.getElementById('devices');
  const streamGrid = streamSection?.querySelector('.card-grid');
  const defaultStreams = streamGrid ? Array.from(streamGrid.querySelectorAll('.device-card')).map((card) => card.textContent.trim()) : [];
  let streams = (() => { try { const saved = JSON.parse(localStorage.getItem('rtd-streams')); return Array.isArray(saved) && saved.length ? saved : defaultStreams; } catch { return defaultStreams; } })();
  streamGrid?.insertAdjacentHTML('afterend', `<div class="stream-management-grid"><form class="card stream-form" id="stream-editor"><h3>Data Stream Editor</h3><p class="subtle">Add or remove stream cards for the demo.</p><label>Stream name<input id="new-stream-name" required placeholder="Example: IoT Gateway" /></label><button class="btn btn-primary small" type="submit">Add Stream</button><button class="btn btn-secondary small" id="reset-streams" type="button">Reset Streams</button><div class="stream-list" id="stream-list"></div></form><div class="card metric-control-card"><h3>Live Metric Controls</h3><p class="subtle">Set a starting point for your live demo values.</p><label>Throughput baseline<input id="throughput-control" type="range" min="150" max="220" value="182" /><output id="throughput-output">182 Mbps</output></label><label>Latency baseline<input id="latency-control" type="range" min="32" max="70" value="48" /><output id="latency-output">48 ms</output></label><button class="btn btn-secondary small" id="apply-metric-controls" type="button">Apply Metrics</button></div></div>`);
  const renderStreams = () => {
    if (streamGrid) streamGrid.innerHTML = streams.map((name) => `<article class="card device-card">${name}</article>`).join('');
    const list = document.getElementById('stream-list');
    if (list) list.innerHTML = streams.map((name, index) => `<div class="stream-row"><span>${name}</span><button type="button" data-remove-stream="${index}" aria-label="Remove ${name}">Remove</button></div>`).join('');
    localStorage.setItem('rtd-streams', JSON.stringify(streams));
  };
  renderStreams();
  document.getElementById('stream-editor')?.addEventListener('submit', (event) => { event.preventDefault(); if (!isAdmin()) return showNotification('Viewer access', 'Only an Admin can edit streams.'); const input = document.getElementById('new-stream-name'); const value = input.value.trim(); if (!value) return; streams.push(value); input.value = ''; renderStreams(); showNotification('Stream added', `${value} is now visible.`); });
  document.getElementById('stream-list')?.addEventListener('click', (event) => { const button = event.target.closest('[data-remove-stream]'); if (!button || !isAdmin()) return; streams.splice(Number(button.dataset.removeStream), 1); renderStreams(); });
  document.getElementById('reset-streams')?.addEventListener('click', () => { if (!isAdmin()) return; streams = [...defaultStreams]; renderStreams(); });
  const throughputControl = document.getElementById('throughput-control'); const latencyControl = document.getElementById('latency-control');
  const updateMetricOutputs = () => { document.getElementById('throughput-output').textContent = `${throughputControl.value} Mbps`; document.getElementById('latency-output').textContent = `${latencyControl.value} ms`; };
  throughputControl?.addEventListener('input', updateMetricOutputs); latencyControl?.addEventListener('input', updateMetricOutputs);
  document.getElementById('apply-metric-controls')?.addEventListener('click', () => { if (!isAdmin()) return showNotification('Viewer access', 'Only an Admin can adjust metrics.'); dashboardState.throughput = Number(throughputControl.value); dashboardState.latency = Number(latencyControl.value); updateDashboardMetrics(); localStorage.setItem('rtd-metric-baseline', JSON.stringify({ throughput: dashboardState.throughput, latency: dashboardState.latency })); showNotification('Metrics applied', 'The live dashboard baseline has been updated.'); });

  adminDashboard?.insertAdjacentHTML('beforeend', `<div class="demo-control-grid" id="demo-controls"><div class="card demo-control-card"><h3>Demo Account Roles</h3><p class="subtle">Current role: <strong id="current-demo-role">Guest</strong></p><p class="subtle">First registered user: <strong>Admin</strong><br>Later registered users: <strong>Viewer</strong></p></div><div class="card demo-control-card"><h3>Alert Rules</h3><form class="alert-rule-form" id="alert-rule-form"><label>Metric<select id="alert-metric"><option value="latency">Latency</option><option value="throughput">Throughput</option></select></label><label>Alert when<select id="alert-operator"><option value="above">Above</option><option value="below">Below</option></select></label><label>Threshold<input id="alert-threshold" type="number" min="1" value="60" required /></label><button class="btn btn-primary small" type="submit">Save Alert Rule</button></form><p class="subtle" id="alert-rule-status">No custom rule saved.</p></div><div class="card demo-control-card"><h3>Import Demo Data</h3><p class="subtle">Import a small CSV or JSON file on this device only.</p><input id="data-import" type="file" accept=".csv,.json,application/json,text/csv" /><p class="subtle" id="import-status">No file imported.</p></div><div class="card demo-control-card"><h3>Dashboard Widgets</h3><p class="subtle">Drag the top dashboard cards to reorder them. Your order is saved locally.</p><button class="widget-reset" id="widget-reset" type="button">Reset Widget Order</button></div></div>`);
  const roleLabel = document.getElementById('current-demo-role');
  const applyRoleAccess = () => { if (roleLabel) roleLabel.textContent = currentRole; document.querySelectorAll('#stream-editor input, #stream-editor button, #apply-metric-controls, #alert-rule-form input, #alert-rule-form select, #alert-rule-form button, #data-import, #widget-reset, #profile-form input, #profile-form button, #team-form input, #team-form select, #team-form button').forEach((control) => { control.disabled = !isAdmin(); }); };
  applyRoleAccess();
  const originalUpdateAuthUI = updateAuthUI;
  // Keep existing login UI behavior and refresh permissions after it runs.
  document.getElementById('login-form')?.addEventListener('submit', () => setTimeout(applyRoleAccess, 0));
  logoutButton?.addEventListener('click', () => setTimeout(applyRoleAccess, 0));
  authButton?.addEventListener('click', () => setTimeout(applyRoleAccess, 0));

  let alertRule = (() => { try { return JSON.parse(localStorage.getItem('rtd-alert-rule')) || null; } catch { return null; } })();
  const alertStatus = document.getElementById('alert-rule-status');
  const renderAlertRule = () => { if (!alertStatus) return; alertStatus.textContent = alertRule ? `${alertRule.metric} alert: ${alertRule.operator} ${alertRule.threshold} (active)` : 'No custom rule saved.'; };
  document.getElementById('alert-rule-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (!isAdmin()) return; alertRule = { metric: document.getElementById('alert-metric').value, operator: document.getElementById('alert-operator').value, threshold: Number(document.getElementById('alert-threshold').value), lastTriggered: 0 }; localStorage.setItem('rtd-alert-rule', JSON.stringify(alertRule)); renderAlertRule(); showNotification('Alert rule saved', 'The live dashboard will monitor this threshold.'); });
  renderAlertRule();
  const existingMetricUpdate = updateDashboardMetrics;
  updateDashboardMetrics = () => { existingMetricUpdate(); if (!alertRule) return; const value = Number(dashboardState[alertRule.metric]); const triggered = alertRule.operator === 'above' ? value > alertRule.threshold : value < alertRule.threshold; if (triggered && Date.now() - alertRule.lastTriggered > 15000) { alertRule.lastTriggered = Date.now(); localStorage.setItem('rtd-alert-rule', JSON.stringify(alertRule)); notifications.unshift({ title: 'Custom alert triggered', message: `${alertRule.metric} is ${value}; rule is ${alertRule.operator} ${alertRule.threshold}.`, unread: true, category: 'System' }); notifications = notifications.slice(0, 8); renderNotificationsPanel(); showNotification('Custom alert triggered', `${alertRule.metric}: ${value}`); } };
  document.getElementById('data-import')?.addEventListener('change', (event) => { if (!isAdmin()) return; const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const text = String(reader.result || ''); let records; if (file.name.toLowerCase().endsWith('.json')) { records = JSON.parse(text); if (!Array.isArray(records)) records = [records]; } else { const [header, ...rows] = text.trim().split(/\r?\n/); const fields = header.split(',').map((field) => field.trim()); records = rows.filter(Boolean).map((row) => Object.fromEntries(row.split(',').map((value, index) => [fields[index] || `field${index + 1}`, value.trim()]))); } if (!records.length) throw new Error('No records found'); localStorage.setItem('rtd-imported-data', JSON.stringify(records)); const sample = records[0]; ['throughput', 'latency'].forEach((key) => { if (Number.isFinite(Number(sample[key]))) dashboardState[key] = Number(sample[key]); }); updateDashboardMetrics(); document.getElementById('import-status').textContent = `Imported ${records.length} record(s). Fields: ${Object.keys(sample).join(', ')}.`; showNotification('Data imported', `${records.length} demo record(s) loaded locally.`); } catch { document.getElementById('import-status').textContent = 'Could not read this file. Use a valid CSV or JSON file.'; } }; reader.readAsText(file); });

  const widgetGrid = document.querySelector('#admin-dashboard > .admin-grid');
  if (widgetGrid) { const order = (() => { try { return JSON.parse(localStorage.getItem('rtd-widget-order')) || []; } catch { return []; } })(); order.forEach((key) => { const card = widgetGrid.querySelector(`[data-dashboard-card="${key}"]`); if (card) widgetGrid.appendChild(card); }); let dragged; widgetGrid.querySelectorAll('[data-dashboard-card]').forEach((card) => { card.classList.add('dashboard-widget'); card.draggable = true; card.addEventListener('dragstart', () => { if (!isAdmin()) return; dragged = card; card.classList.add('dragging'); }); card.addEventListener('dragend', () => { card.classList.remove('dragging'); if (isAdmin()) localStorage.setItem('rtd-widget-order', JSON.stringify(Array.from(widgetGrid.querySelectorAll('[data-dashboard-card]')).map((item) => item.dataset.dashboardCard))); }); card.addEventListener('dragover', (event) => { if (!dragged || !isAdmin()) return; event.preventDefault(); if (card !== dragged) widgetGrid.insertBefore(dragged, card); }); }); }
  document.getElementById('widget-reset')?.addEventListener('click', () => { localStorage.removeItem('rtd-widget-order'); location.reload(); });

  const mapNoteHost = document.querySelector('.map-info-card');
  mapNoteHost?.insertAdjacentHTML('beforeend', `<form class="map-note-form" id="map-note-form"><label>Location note<input id="map-note-input" placeholder="Add a presentation note" /></label><button class="btn btn-secondary small" type="submit">Save Note</button></form><p class="subtle" id="map-note-status">Select a location to add a note.</p>`);
  let selectedMapLocation = mapLocation?.textContent || 'Bengaluru'; const mapNotes = (() => { try { return JSON.parse(localStorage.getItem('rtd-map-notes')) || {}; } catch { return {}; } })();
  const refreshMapNote = () => { const input = document.getElementById('map-note-input'); const status = document.getElementById('map-note-status'); if (input) input.value = mapNotes[selectedMapLocation] || ''; if (status) status.textContent = mapNotes[selectedMapLocation] ? `Saved note for ${selectedMapLocation}: ${mapNotes[selectedMapLocation]}` : `No note saved for ${selectedMapLocation}.`; };
  mapMarkers.forEach((marker) => marker.addEventListener('click', () => { selectedMapLocation = marker.dataset.location; setTimeout(refreshMapNote, 0); }));
  document.getElementById('map-note-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (!isAdmin()) return showNotification('Viewer access', 'Only an Admin can save map notes.'); mapNotes[selectedMapLocation] = document.getElementById('map-note-input').value.trim(); localStorage.setItem('rtd-map-notes', JSON.stringify(mapNotes)); refreshMapNote(); }); refreshMapNote();

  if (!document.getElementById('presentation-mode')) document.querySelector('.hero-actions')?.insertAdjacentHTML('beforeend', '<button class="btn btn-secondary" id="presentation-mode" type="button">Start Demo Tour</button>');
  if (!document.getElementById('report-preview')) reportSummary?.insertAdjacentHTML('beforebegin', '<button class="btn btn-secondary" id="report-preview" type="button">Open Report Preview</button>');
  const reportModal = document.createElement('div'); reportModal.className = 'report-preview-backdrop'; reportModal.innerHTML = `<article class="card report-preview"><div class="report-preview-header"><div><p class="eyebrow">Report Preview</p><h2>Real-Time Data & Modern Tech</h2></div><button class="modal-close" type="button" aria-label="Close report preview">×</button></div><p id="report-preview-meta"></p><div class="report-preview-metrics" id="report-preview-metrics"></div><h3>Executive Summary</h3><p id="report-preview-summary">Platform health is stable with live frontend demo analytics.</p><div class="hero-actions report-preview-actions"><button class="btn btn-primary" id="print-report" type="button">Print / Save PDF</button><button class="btn btn-secondary" id="close-report" type="button">Close</button></div></article>`; body.appendChild(reportModal);
  const openReport = () => { document.getElementById('report-preview-meta').textContent = `Prepared ${new Date().toLocaleString()} • ${isLoggedIn ? profile.name : 'Guest'} • ${currentRole}`; document.getElementById('report-preview-metrics').innerHTML = `<div><span>Throughput</span><strong>${dashboardState.throughput} Mbps</strong></div><div><span>Latency</span><strong>${dashboardState.latency} ms</strong></div><div><span>Uptime</span><strong>${dashboardState.uptime}%</strong></div>`; reportModal.classList.add('open'); };
  document.getElementById('report-preview')?.addEventListener('click', openReport); document.getElementById('close-report')?.addEventListener('click', () => reportModal.classList.remove('open')); reportModal.querySelector('.modal-close').addEventListener('click', () => reportModal.classList.remove('open')); document.getElementById('print-report')?.addEventListener('click', () => window.print());

  const mobileNav = document.createElement('nav'); mobileNav.className = 'mobile-bottom-nav'; mobileNav.setAttribute('aria-label', 'Mobile navigation'); mobileNav.innerHTML = '<a href="#home">Home</a><a href="#dashboard">Dashboard</a><a href="#analytics">Analytics</a><a href="#admin-dashboard">Admin</a><a href="#technology-stack">More</a>'; body.appendChild(mobileNav);
  const tourButton = document.getElementById('presentation-mode'); const tourSteps = ['home', 'dashboard', 'analytics', 'admin-dashboard', 'reports', 'world-map', 'technology-stack']; let tourIndex = 0; let tourTimer; const tourBar = document.createElement('div'); tourBar.className = 'demo-tour-bar'; tourBar.hidden = true; body.appendChild(tourBar);
  const renderTour = () => { const title = document.getElementById(tourSteps[tourIndex])?.querySelector('h2')?.textContent || tourSteps[tourIndex]; tourBar.innerHTML = `<strong>Demo Tour: ${title} (${tourIndex + 1}/${tourSteps.length})</strong><span class="demo-tour-controls"><button id="tour-pause" type="button">Pause</button><button id="tour-exit" type="button">Exit</button></span>`; document.getElementById('tour-pause')?.addEventListener('click', () => { if (tourTimer) { clearInterval(tourTimer); tourTimer = null; document.getElementById('tour-pause').textContent = 'Resume'; } else { startTourTimer(); document.getElementById('tour-pause').textContent = 'Pause'; } }); document.getElementById('tour-exit')?.addEventListener('click', stopTour); };
  const advanceTour = () => { document.getElementById(tourSteps[tourIndex])?.scrollIntoView({ behavior: 'smooth', block: 'start' }); renderTour(); tourIndex = (tourIndex + 1) % tourSteps.length; };
  const startTourTimer = () => { tourTimer = setInterval(advanceTour, 5000); };
  const stopTour = () => { clearInterval(tourTimer); tourTimer = null; tourBar.hidden = true; body.classList.remove('presentation-mode'); };
  tourButton?.addEventListener('click', () => { tourIndex = 0; tourBar.hidden = false; body.classList.add('presentation-mode'); advanceTour(); startTourTimer(); });

  // Overall Performance uses a built-in SVG view first, then updates it with live metrics.
  // The visual is present in HTML even if a later JavaScript feature fails.
  {
    const lineCtx = document.getElementById('line-chart');
    const barCtx = document.getElementById('bar-chart');
    const weeklyCtx = document.getElementById('weekly-chart');
    const monthlyCtx = document.getElementById('monthly-chart');
    const doughnutCtx = document.getElementById('doughnut-chart');
    const flowCtx = document.getElementById('analytics-flow-chart');
    const dailyCtx = document.getElementById('analytics-daily-chart');
    const weeklyAnalyticsCtx = document.getElementById('analytics-weekly-chart');
    const monthlyAnalyticsCtx = document.getElementById('analytics-monthly-chart');

    const chartState = {
      line: [120, 152, 168, 190, 212, 236],
      bar: [74, 78, 82, 90],
      weekly: [68, 72, 74, 64, 76, 82, 78],
      monthly: [64, 71, 69, 76, 74, 81],
      doughnut: [68, 18, 14]
    };
    window.chartState = chartState;

    const renderPerformanceCharts = () => {
      const scoreEl = document.getElementById('performance-score');
      const throughputEl = document.getElementById('performance-throughput');
      const latencyEl = document.getElementById('performance-latency');
      const syncEl = document.getElementById('performance-sync');
      const uptimeEl = document.getElementById('performance-uptime');
      const updateEl = document.getElementById('performance-last-update');
      const lineEl = document.getElementById('performance-line');
      const areaEl = document.getElementById('performance-area');
      const pointsEl = document.getElementById('performance-points');
      if (throughputEl) throughputEl.textContent = `${dashboardState.throughput} Mbps`;
      if (latencyEl) latencyEl.textContent = `${dashboardState.latency} ms`;
      if (syncEl) syncEl.textContent = `${dashboardState.sync}%`;
      if (uptimeEl) uptimeEl.textContent = `${dashboardState.uptime}%`;
      const score = Math.max(0, Math.min(100, Math.round((dashboardState.sync * 0.25) + (dashboardState.uptime * 0.25) + (Math.max(0, 100 - dashboardState.latency) * 0.2) + (Math.min(100, dashboardState.throughput / 2) * 0.3))));
      if (scoreEl) scoreEl.textContent = score;
      if (updateEl) updateEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
      if (lineEl && areaEl && pointsEl) {
        const source = chartState.line.slice(-7);
        const min = Math.min(...source);
        const max = Math.max(...source);
        const range = Math.max(1, max - min);
        const pts = source.map((v, i) => {
          const x = 40 + (i * 835) / Math.max(1, source.length - 1);
          const y = 225 - ((v - min) / range) * 155;
          return [x, y];
        });
        lineEl.setAttribute('points', pts.map(([x,y]) => `${x},${y}`).join(' '));
        areaEl.setAttribute('d', `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x,y]) => `L${x} ${y}`).join(' ') + ` L875 235 L40 235 Z`);
        pointsEl.innerHTML = pts.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('');
      }
      drawFallbackChart(lineCtx, chartState.line, 'line', 'Data flow');
      drawFallbackChart(barCtx, chartState.bar, 'bar', 'System load');
      drawFallbackChart(weeklyCtx, chartState.weekly, 'bar', 'Weekly performance');
      drawFallbackChart(monthlyCtx, chartState.monthly, 'line', 'Monthly trend');
      drawFallbackChart(doughnutCtx, chartState.doughnut, 'doughnut', 'Resource mix');
      if (flowCtx) drawFallbackChart(flowCtx, [140, 168, 182, 174, 190, 205], 'line', 'Real-time flow');
      if (dailyCtx) drawFallbackChart(dailyCtx, [82, 76, 91, 88, 96, 102, 109], 'bar', 'Daily activity');
      if (weeklyAnalyticsCtx) drawFallbackChart(weeklyAnalyticsCtx, [72, 76, 81, 87], 'line', 'Weekly performance');
      if (monthlyAnalyticsCtx) drawFallbackChart(monthlyAnalyticsCtx, [64, 69, 74, 77, 81, 88], 'line', 'Monthly trend');
    };

    window.updateCharts = renderPerformanceCharts;
    renderPerformanceCharts();
    window.addEventListener('load', () => window.requestAnimationFrame(renderPerformanceCharts), { once: true });
    window.addEventListener('resize', renderPerformanceCharts);
  }

  mapMarkers.forEach((marker) => {
    marker.addEventListener('click', () => {
      mapMarkers.forEach((item) => item.classList.remove('active'));
      marker.classList.add('active');
      mapLocation.textContent = marker.dataset.location;
      mapInfo.textContent = marker.dataset.info;
    });
  });

  // Normal startup path. This is also safe if the window load event already fired.
  window.requestAnimationFrame(dismissLoadingScreen);

  const particles = [];
  const ctx = canvas.getContext('2d');
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles.length = 0;
    const count = Math.min(70, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  };

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79, 195, 247, 0.45)';
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animateParticles();

  // Full-stack bridge: connects the existing frontend to the Node backend.
  // When served by server.js, authentication, contact messages, and live metrics use the backend.
  const apiFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem('rtd-token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  };

  const featureData = {
    dashboard: { eyebrow:'OVERVIEW', title:'Dashboard Command View', description:'Live platform KPIs, system performance and operational activity.', stats:[['Active Streams','128'],['Live Metrics','356'],['Data Processed','1.8 TB'],['Uptime','99.9%']], columns:['Metric','Current','Change','Status'], rows:[['Throughput','188 Mbps','+8.2%','Healthy'],['Latency','47 ms','-6.4%','Healthy'],['Cloud Sync','98%','+2.1%','Stable'],['Alerts','3','-2 today','Medium']], actions:['Open Analytics','View Streams'] },
    about: { eyebrow:'PLATFORM', title:'Platform Scope & Coverage', description:'Understand what the platform monitors, processes and automates.', stats:[['Data Sources','128'],['Industries','7'],['AI Workflows','18'],['Coverage','24/7']], columns:['Capability','Mode','Coverage','Status'], rows:[['Monitoring','Real-time','128 sources','Active'],['Analytics','Predictive','7 domains','Ready'],['Automation','Event-driven','18 workflows','Running'],['Security','Role-based','All users','Protected']], actions:['View Features','Open Security'] },
    features: { eyebrow:'CAPABILITIES', title:'Feature Control Center', description:'A complete map of the platform capabilities available to the signed-in user.', stats:[['Capabilities','8'],['Automation','24/7'],['AI Models','12'],['Security','Enterprise']], columns:['Capability','State','Coverage','Owner'], rows:[['Real-Time Monitoring','Active','128 streams','Platform'],['AI Insights','Ready','92% confidence','Analytics'],['Cloud Integration','Connected','99.9% uptime','Cloud'],['Smart Automation','Running','18 workflows','Operations']], actions:['Open Analytics','Open Operations'] },
    devices: { eyebrow:'DATA STREAMS', title:'Live Stream Operations', description:'Inspect every connected pipeline, its throughput, latency and current health.', stats:[['Active Streams','128'],['Records/min','18,420'],['Avg Latency','47 ms'],['Health','99.6%']], columns:['Stream','Status','Records/min','Latency'], rows:[['Telemetry Gateway','Online','3,240','42 ms'],['Cloud Events','Online','5,180','38 ms'],['IoT Sensors','Online','4,860','51 ms'],['Analytics Feed','Online','5,140','57 ms']], actions:['Refresh Streams','Open Analytics'] },
    analytics: { eyebrow:'ANALYTICS', title:'Analytics Intelligence Center', description:'Compare trends, monitor anomalies and turn live telemetry into decisions.', stats:[['Data Flow','188 Mbps'],['Processing','94%'],['Sync','98%'],['Risk','Low']], columns:['Analysis','Result','Confidence','Status'], rows:[['7-day performance','+14.8%','92%','Healthy'],['30-day throughput','+8.2%','89%','Improving'],['Anomaly rate','1.4%','96%','Low'],['Forecast','+11.6%','92%','Positive']], actions:['Refresh Insights','Open Comparison'] },
    'admin-dashboard': { eyebrow:'USERS & ACCESS', title:'Identity and Access Center', description:'Review users, roles, sessions and account activity from one secure view.', stats:[['Users','184'],['Admins','3'],['Viewers','181'],['Active Sessions','12']], columns:['User','Role','Status','Last Activity'], rows:[['NAGENDRA REDDY','Admin','Active','Today 09:20'],['Demo Viewer','Viewer','Active','Today 08:42'],['JITHENDRA','Viewer','Active','Yesterday 18:12'],['SAIKUMAR','Viewer','Active','Yesterday 16:55']], actions:['Review Security','Open Settings'] },
    reports: { eyebrow:'REPORTS', title:'Report Generation Center', description:'Track generated reports, schedules, formats and delivery status.', stats:[['Reports','24'],['Generated Today','6'],['Scheduled','8'],['Success Rate','100%']], columns:['Report','Status','Schedule','Format'], rows:[['Daily Operations','Generated','Today 09:15','PDF'],['Weekly Performance','Ready','Mon 08:00','CSV'],['Monthly Analytics','Scheduled','1 Sep 2026','PDF'],['Security Summary','Generated','Today 07:45','PDF']], actions:['Generate Report','Open Analytics'] },
    'command-center': { eyebrow:'OPERATIONS', title:'Operations Control Room', description:'Monitor services, pipelines, incidents and response times in real time.', stats:[['Services','18/18'],['Incidents','2'],['Pipelines','12'],['Response','42 ms']], columns:['Service','State','Metric','Status'], rows:[['API Gateway','Operational','42 ms','Healthy'],['Data Pipeline','Operational','188 Mbps','Healthy'],['Cloud Sync','Operational','98%','Stable'],['Alert Engine','Operational','2 alerts','Watching']], actions:['Review Alerts','Open Streams'] },
    'world-map': { eyebrow:'GLOBAL COVERAGE', title:'Gateway & Region Monitor', description:'Track connected regions and the health of global data gateways.', stats:[['Regions','4'],['Gateways','12'],['Streams','128'],['Global Uptime','99.5%']], columns:['Region','Gateway','Streams','Uptime'], rows:[['Bengaluru','Gateway-01','52','99.5%'],['Seattle','Gateway-02','31','99.8%'],['Berlin','Gateway-03','27','99.7%'],['Toronto','Gateway-04','18','99.6%']], actions:['Open Streams','Open Security'] },
    security: { eyebrow:'SECURITY', title:'Security & System Health', description:'Review authentication, API protection, encryption and active risk signals.', stats:[['Protection','Active'],['Risk','Low'],['Failed Logins','2'],['Sessions','3']], columns:['Protection Layer','State','Detail','Risk'], rows:[['Authentication','Protected','MFA enabled','Low'],['API Security','Protected','Token validation','Low'],['Data Encryption','Protected','At rest + transit','Low'],['Threat Monitor','Watching','2 reviewed events','Medium']], actions:['Review Users','Open Alerts'] },
    settings: { eyebrow:'SETTINGS', title:'Platform Preferences', description:'Configure appearance, refresh behavior, alerts and the signed-in profile.', stats:[['Theme','Dark'],['Refresh','3 sec'],['Alerts','Enabled'],['Access','Session only']], columns:['Setting','Value','Scope','State'], rows:[['Auto-refresh','3 sec','Live metrics','Enabled'],['Notifications','Enabled','System + Data','Enabled'],['Dashboard','Detailed','KPI + charts','Active'],['Access','Session only','Authentication','Protected']], actions:['Save Preferences','Review Profile'] },
    team: { eyebrow:'TEAM', title:'Project Team Workspace', description:'Review project ownership, responsibilities and team activity.', stats:[['Members','5'],['Frontend','1'],['Backend','1'],['Analytics','1']], columns:['Member','Responsibility','Status','Focus'], rows:[['BASAV SIR','Project Guide','Active','Project review'],['NAGENDRA REDDY','Project Administrator','Active','Platform'],['JITHENDRA','Frontend Developer','Active','UI'],['SAIKUMAR','Backend/Platform Developer','Active','APIs'],['RAYHAN','Data & Analytics Developer','Active','Analytics']], actions:['Edit Team','Open Contact'] },
    contact: { eyebrow:'SUPPORT', title:'Support & Contact Center', description:'Track incoming requests, priorities, ownership and service response.', stats:[['Open Tickets','3'],['Resolved Today','7'],['Avg Response','18 min'],['SLA','98%']], columns:['Request','Status','Priority','Owner'], rows:[['API integration','Open','High','Platform'],['Dashboard customization','In progress','Medium','Frontend'],['Report export','Resolved','Low','Analytics']], actions:['Create Ticket','Open Reports'] },
    notifications: { eyebrow:'ALERTS & NOTIFICATIONS', title:'Live Alert Center', description:'Review system alerts, severity, acknowledgement state and recent events in one place.', stats:[['Active Alerts','3'],['Critical','0'],['Warnings','2'],['Resolved Today','7']], columns:['Alert','Category','Severity','Time'], rows:[['Latency approaching threshold','System','Medium','2 min ago'],['Cloud snapshot completed','Data','Info','8 min ago'],['Weekly report ready','Report','Info','18 min ago'],['New viewer session detected','Security','Low','31 min ago']], actions:['Mark All Read','Open Security'] }
  };

  // This must run after featureData has been created. Running it during startup
  // caused a temporal-dead-zone error and stopped the entire app before the
  // login handlers could be attached.
  renderFeatureData();
  refreshFeatureIndex();
  syncFeatureView();

  const featureRouteMap = { 'Open Analytics':'analytics', 'View Streams':'devices', 'Open Comparison':'analytics', 'Open Operations':'command-center', 'Open Security':'security', 'Open Settings':'settings', 'Review Security':'security', 'Generate Report':'reports', 'Open Analytics':'analytics', 'Review Alerts':'notifications', 'Open Streams':'devices', 'Review Users':'admin-dashboard', 'Open Alerts':'notifications', 'Save Preferences':'settings', 'Review Profile':'settings', 'Edit Team':'team', 'Open Contact':'contact', 'Create Ticket':'contact' };

  function renderFeatureData() {
    const main = document.querySelector('main');
    if (!main) return;

    // Notifications is a first-class feature page, not an injected afterthought.
    let notificationSection = document.getElementById('notifications');
    if (!notificationSection) {
      notificationSection = document.createElement('section');
      notificationSection.id = 'notifications';
      notificationSection.className = 'section feature-page-section';
      main.appendChild(notificationSection);
    }

    Object.entries(featureData).forEach(([id, data]) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.classList.add('feature-page-section');
      // Keep the reference-style Dashboard intact; all other top-level features get dedicated pages.
      if (id === 'dashboard') return;
      section.querySelectorAll('.feature-workspace').forEach((node) => node.remove());

      const panel = document.createElement('div');
      panel.className = 'feature-workspace feature-workspace-v2';
      const stats = data.stats.map(([label,value], index) => `<article class="feature-kpi feature-kpi-v2"><span>${label}</span><strong data-feature-stat="${id}:${label}">${value}</strong><small>${index === 0 ? 'Current reading' : index === 1 ? 'Compared with baseline' : index === 2 ? 'Operational target' : 'Current status'}</small></article>`).join('');
      const head = data.columns.map((column) => `<span>${column}</span>`).join('');
      const rows = data.rows.map((row, rowIndex) => `<div class="feature-table-row" data-feature-row="${rowIndex}">${row.map((cell,index)=>`<span class="${index===0?'feature-data-name':''}">${cell}</span>`).join('')}</div>`).join('');
      const actions = data.actions.map(action => `<button type="button" class="btn btn-secondary small feature-action" data-feature-action="${action}">${action}</button>`).join('');
      const bars = data.stats.map(([label],index) => { const pct=[92,86,96,99][index] || 88; return `<div class="feature-progress"><div><span>${label}</span><b>${pct}%</b></div><span class="feature-progress-track"><i style="width:${pct}%"></i></span></div>`; }).join('');
      const healthRows = data.rows.slice(0,3).map((row) => `<div class="feature-health-row"><span>${row[0]}</span><b>${row[row.length-1]}</b></div>`).join('');
      panel.innerHTML = `
        <div class="feature-workspace-header feature-workspace-header-v2">
          <div><p class="eyebrow">${data.eyebrow}</p><h2>${data.title}</h2><p class="subtle">${data.description}</p></div>
          <div class="feature-live-state"><span class="live-dot"></span> Live workspace</div>
        </div>
        <div class="feature-kpi-grid feature-kpi-grid-v2">${stats}</div>
        <div class="feature-workspace-grid feature-workspace-grid-v2">
          <section class="feature-table-card feature-table-card-v2">
            <div class="feature-table-toolbar"><div><p class="eyebrow">LIVE DATA</p><h3>${id === 'analytics' ? 'Decision-ready analysis' : id === 'reports' ? 'Report queue' : id === 'devices' ? 'Connected pipelines' : id === 'admin-dashboard' ? 'Account directory' : 'Current records'}</h3></div><span class="table-count">${data.rows.length} records</span></div>
            <div class="feature-table-head">${head}</div>${rows}
          </section>
          <aside class="feature-health-card feature-health-card-v2">
            <p class="eyebrow">HEALTH & CONTROL</p><h3>Operational status</h3>
            <div class="feature-health-summary"><strong>Stable</strong><span>All core services responding</span></div>
            ${bars}
            <div class="feature-health-list">${healthRows}</div>
            <div class="feature-action-row">${actions}</div>
          </aside>
        </div>`;

      // Turn the old section markup into a clean, dedicated feature page.
      Array.from(section.children).forEach((child) => {
        child.hidden = true;
        child.setAttribute('aria-hidden', 'true');
      });
      section.appendChild(panel);
      panel.querySelectorAll('[data-feature-action]').forEach((button) => button.addEventListener('click', () => {
        const action = button.dataset.featureAction;
        const target = featureRouteMap[action];
        if (target && typeof showFeature === 'function') showFeature(target);
        else if (action === 'Refresh Streams') { applyServerMetrics(dashboardState); showNotification('Streams refreshed','Live stream data has been refreshed.'); }
        else if (action === 'Mark All Read') { showNotification('Notifications cleared','All current alerts are marked as read.'); }
        else showNotification(action, `${data.title} action completed.`);
      }));
    });
  }

  function updateFeatureDataFromMetrics(data) {
    const replacements = {
      'devices:Records/min': `${Math.round(data.network * 57)} rec/min`,
      'devices:Avg Latency': `${Math.round(data.latency)} ms`,
      'devices:Health': `${Math.max(98, Number(data.uptime) - .2).toFixed(1)}%`,
      'analytics:Data Flow': `${Math.round(data.throughput)} Mbps`,
      'analytics:Processing': `${Math.max(90, Math.round(100 - data.processing/2))}%`,
      'analytics:Sync': `${Math.round(data.sync)}%`,
      'analytics:Risk': data.alertLevel === 'High' ? 'High' : 'Low',
      'admin-dashboard:Users': `${Math.round(data.users)}`,
      'command-center:Response': `${Math.round(data.latency)} ms`,
      'security:Risk': data.alertLevel === 'High' ? 'High' : 'Low',
      'world-map:Global Uptime': `${Number(data.uptime).toFixed(1)}%`,
      'settings:Refresh': `${Math.round(data.latency/15)+1} sec`
    };
    Object.entries(replacements).forEach(([key,value])=>{ const el=document.querySelector(`[data-feature-stat="${key}"]`); if(el) el.textContent=value; });
    const alert = document.getElementById('feature-alert-count'); if(alert) alert.textContent = data.alertLevel === 'High' ? '5' : data.alertLevel === 'Medium' ? '3' : '1';
  }

  const applyServerMetrics = (data) => {
    Object.assign(dashboardState, {
      users: Number(data.users), records: Number(data.records), uptime: Number(data.uptime), cloud: data.cloud,
      speed: Number(data.speed), network: Number(data.network), throughput: Number(data.throughput), latency: Number(data.latency),
      alertLevel: data.alertLevel, sync: Number(data.sync), signal: Number(data.signal), processing: Number(data.processing),
      weatherTemp: Number(data.weatherTemp), weatherHumidity: Number(data.weatherHumidity), weatherWind: Number(data.weatherWind),
      weatherPressure: Number(data.weatherPressure), weatherCondition: data.weatherCondition
    });
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('metric-users', Math.round(data.users));
    set('metric-records', Number(data.records).toLocaleString());
    set('metric-uptime', `${Number(data.uptime).toFixed(1)}%`);
    set('metric-cloud', data.cloud);
    set('metric-speed', `${Number(data.speed).toFixed(1)}x`);
    set('metric-network', `${Math.round(data.network)} Mbps`);
    set('sensor-temperature', `${Math.round(data.throughput)} Mbps`);
    set('sensor-humidity', `${Math.round(data.latency)} ms`);
    set('sensor-air-quality', data.alertLevel);
    set('sensor-rain', `${Math.round(data.processing)}%`);
    set('sensor-soil', `${Math.round(data.sync)}%`);
    set('sensor-light', `${Math.round(data.signal)}%`);
    set('sensor-energy', `${Number(data.speed).toFixed(1)}x`);
    set('sensor-device-status', data.cloud);
    set('weather-temp', `${Math.round(data.weatherTemp)}°C`);
    set('weather-condition', data.weatherCondition);
    set('weather-humidity', `${Math.round(data.weatherHumidity)}%`);
    set('weather-wind', `${Math.round(data.weatherWind)} km/h`);
    set('weather-pressure', `${Math.round(data.weatherPressure)} hPa`);
    renderFeatureData();
    updateFeatureDataFromMetrics(data);
  };

  const applyServerUser = (user) => {
    if (!user) return;
    currentUser = user;
    currentRole = user.role || 'Viewer';
    isLoggedIn = true;
    profile = { name: user.name, email: user.email, role: user.role === 'Admin' ? 'Project Administrator' : 'Registered Viewer' };
    sessionStorage.setItem('rtd-current-user', JSON.stringify(user));
    sessionStorage.setItem('rtd-demo-auth', 'true');
    sessionStorage.setItem('rtd-demo-role', user.role);
    sessionStorage.setItem('rtd-profile', JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role === 'Admin' ? 'Project Administrator' : 'Registered Viewer'
    }));
  };

  const loginWithBackend = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = document.getElementById('login-status');
    const identity = document.getElementById('login-identity')?.value.trim() || '';
    const password = document.getElementById('login-password')?.value || '';
    if (!identity || !password) {
      status.textContent = 'Please enter your username/email and password.';
      status.classList.add('error');
      return;
    }
    try {
      status.textContent = 'Connecting to server…';
      status.classList.remove('error');
      const result = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identity, password })
      });
      sessionStorage.setItem('rtd-token', result.token);
      applyServerUser(result.user);
      updateAuthUI();
      const destination = pendingFeature || sessionStorage.getItem('rtd-pending-feature') || 'dashboard';
      pendingFeature = null;
      sessionStorage.removeItem('rtd-pending-feature');
      closeLogin();
      showFeature(destination);
      renderProfile?.();
      status.textContent = `Login successful. Welcome, ${result.user.name}!`;
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  };

  const registerWithBackend = async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = document.getElementById('register-status');
    const payload = {
      name: document.getElementById('register-name')?.value.trim() || '',
      email: document.getElementById('register-email')?.value.trim() || '',
      username: document.getElementById('register-username')?.value.trim() || '',
      password: document.getElementById('register-password')?.value || ''
    };
    const confirm = document.getElementById('register-confirm-password')?.value || '';
    if (!payload.name || !payload.email || !payload.username || !payload.password) {
      status.textContent = 'Please fill in every registration field.';
      status.classList.add('error');
      return;
    }
    if (payload.password !== confirm) {
      status.textContent = 'Passwords do not match.';
      status.classList.add('error');
      return;
    }
    try {
      status.textContent = 'Creating secure account…';
      status.classList.remove('error');
      const result = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      sessionStorage.setItem('rtd-token', result.token);
      applyServerUser(result.user);
      updateAuthUI();
      closeRegister();
      showFeature('dashboard');
      renderProfile?.();
      status.textContent = 'Account created. Your dashboard is ready.';
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  };

  loginForm?.addEventListener('submit', loginWithBackend, true);
  registerForm?.addEventListener('submit', registerWithBackend, true);

  const backendContactForm = document.querySelector('.contact-form');
  backendContactForm?.addEventListener('submit', async (event) => {
    const name = backendContactForm.querySelector('input[type="text"]')?.value?.trim();
    const email = backendContactForm.querySelector('input[type="email"]')?.value?.trim();
    const textInputs = backendContactForm.querySelectorAll('input[type="text"]');
    const subject = textInputs[1]?.value?.trim() || 'Contact request';
    const message = backendContactForm.querySelector('textarea')?.value?.trim();
    if (!name || !email || !message) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) });
      const button = contactForm.querySelector('button[type="submit"]');
      if (button) {
        const original = button.textContent;
        button.textContent = 'Message sent ✓';
        window.setTimeout(() => { button.textContent = original; }, 1800);
      }
      backendContactForm.reset();
    } catch {
      // Existing frontend handler remains the fallback.
    }
  }, true);

  ensureNoEmptyPanels();

  const backendToken = sessionStorage.getItem('rtd-token');
  if (backendToken) {
    apiFetch('/api/auth/me').then(({ user }) => applyServerUser(user)).catch(() => {
      sessionStorage.removeItem('rtd-token');
      sessionStorage.removeItem('rtd-current-user');
      sessionStorage.removeItem('rtd-demo-auth');
      sessionStorage.removeItem('rtd-demo-role');
      currentUser = null;
      currentRole = 'Guest';
      isLoggedIn = false;
      updateAuthUI();
      syncFeatureView();
    });
  }

  fetch('/api/health').then(async () => {
    try {
      const initial = await apiFetch('/api/metrics');
      applyServerMetrics(initial);
    } catch {}
    if (window.EventSource) {
      const stream = new EventSource('/api/stream');
      stream.onopen = () => {
        document.documentElement.dataset.realtime = 'connected';
        window.clearInterval(dashboardRefreshTimer);
      };
      stream.onerror = () => { document.documentElement.dataset.realtime = 'offline'; };
      stream.addEventListener('metrics:update', (event) => {
        try {
          const data = JSON.parse(event.data);
          applyServerMetrics(data);
          if (lastUpdateLabel) lastUpdateLabel.textContent = `Last update: ${new Date(data.updatedAt || Date.now()).toLocaleTimeString()}`;
        } catch {}
      });
    }
  }).catch(() => {
    // Static/file:// mode uses the original local simulation.
  });
});
