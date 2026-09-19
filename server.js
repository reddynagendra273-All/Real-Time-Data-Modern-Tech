const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const url = require('url');
let geminiAI;

async function getGeminiAI() {
  if (!geminiAI) {
    const { GoogleGenAI } = await import('@google/genai');

    geminiAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return geminiAI;
}

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');

const DB_DIR = path.dirname(DB_FILE);

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: [],
      contactMessages: []
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
  }
}

ensureDbFile();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const sseClients = new Set();

let metrics = {
  users: 184,
  records: 284560,
  uptime: 99.9,
  cloud: 'Stable',
  speed: 3.2,
  network: 322,
  throughput: 188,
  latency: 47,
  alertLevel: 'Medium',
  sync: 98,
  signal: 92,
  processing: 26,
  weatherTemp: 26,
  weatherHumidity: 64,
  weatherWind: 14,
  weatherPressure: 1013,
  weatherCondition: 'Clear',
  updatedAt: new Date().toISOString()
};

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function hash(p) {
  return crypto
    .createHash('sha256')
    .update(String(p))
    .digest('hex');
}

function safeUser(u) {
  const { passwordHash, ...safe } = u;
  return safe;
}

function tokenFor(id) {
  return Buffer.from(
    `${id}.${Date.now()}.${crypto.randomBytes(12).toString('hex')}`
  ).toString('base64url');
}

function userFromToken(req) {
  const h = String(req.headers.authorization || '');

  if (!h.startsWith('Bearer ')) {
    return null;
  }

  let raw = '';

  try {
    raw = Buffer.from(h.slice(7), 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const id = raw.split('.')[0];

  return readDb().users.find(u => u.id === id) || null;
}

function send(res, status, data) {
  const body = JSON.stringify(data);

  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });

  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', c => {
      body += c;

      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', reject);
  });
}

function broadcast(event, data) {
  const payload =
    `event: ${event}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {}
  }
}

function tick() {
  metrics.users = Math.max(
    160,
    Math.min(
      220,
      metrics.users + (Math.random() > 0.5 ? 3 : -2)
    )
  );

  metrics.records = Math.min(
    320000,
    metrics.records + Math.floor(Math.random() * 1200 + 700)
  );

  metrics.uptime = Number(
    (99.8 + Math.random() * 0.2).toFixed(1)
  );

  metrics.cloud =
    metrics.uptime > 99.85 ? 'Stable' : 'Watch';

  metrics.speed = Number(
    Math.max(
      2.5,
      Math.min(
        3.8,
        metrics.speed + (Math.random() > 0.5 ? 0.05 : -0.03)
      )
    ).toFixed(1)
  );

  metrics.network = Math.max(
    280,
    Math.min(
      360,
      metrics.network + Math.floor(Math.random() * 14 - 7)
    )
  );

  metrics.throughput = Math.max(
    150,
    Math.min(
      220,
      metrics.throughput + (Math.random() > 0.5 ? 4 : -3)
    )
  );

  metrics.latency = Math.max(
    32,
    Math.min(
      70,
      metrics.latency + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.alertLevel =
    metrics.latency > 58
      ? 'High'
      : metrics.latency > 44
      ? 'Medium'
      : 'Low';

  metrics.sync = Math.max(
    92,
    Math.min(
      100,
      metrics.sync + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.signal = Math.max(
    84,
    Math.min(
      98,
      metrics.signal + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.processing = Math.max(
    18,
    Math.min(
      36,
      metrics.processing + (Math.random() > 0.5 ? 2 : -1)
    )
  );

  metrics.weatherTemp = Math.max(
    18,
    Math.min(
      31,
      metrics.weatherTemp + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.weatherHumidity = Math.max(
    45,
    Math.min(
      82,
      metrics.weatherHumidity + (Math.random() > 0.5 ? 2 : -2)
    )
  );

  metrics.weatherWind = Math.max(
    8,
    Math.min(
      26,
      metrics.weatherWind + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.weatherPressure = Math.max(
    1002,
    Math.min(
      1022,
      metrics.weatherPressure + (Math.random() > 0.5 ? 1 : -1)
    )
  );

  metrics.weatherCondition =
    metrics.weatherHumidity > 75 ? 'Rain' : 'Clear';

  metrics.updatedAt = new Date().toISOString();

  broadcast('metrics:update', metrics);
}

async function handle(req, res) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // =========================
  // HEALTH
  // =========================

  if (
    req.method === 'GET' &&
    pathname === '/api/health'
  ) {
    return send(res, 200, {
      status: 'ok',
      service: 'Real-Time Data API',
      time: new Date().toISOString()
    });
  }

  // =========================
  // METRICS
  // =========================

  if (
    req.method === 'GET' &&
    pathname === '/api/metrics'
  ) {
    return send(res, 200, metrics);
  }

  // =========================
  // CURRENT USER
  // =========================

  if (
    req.method === 'GET' &&
    pathname === '/api/auth/me'
  ) {
    const user = userFromToken(req);

    return user
      ? send(res, 200, { user: safeUser(user) })
      : send(res, 401, {
          error: 'Authentication required.'
        });
  }

  // =========================
  // LOGIN
  // =========================

  if (
    req.method === 'POST' &&
    pathname === '/api/auth/login'
  ) {
    try {
      const b = await readBody(req);

      const identity = String(
        b.identity || ''
      ).trim().toLowerCase();

      const password = String(
        b.password || ''
      );

      const db = readDb();

      const u = db.users.find(
        x =>
          x.username.toLowerCase() === identity ||
          x.email.toLowerCase() === identity
      );

      const ok =
        u &&
        (
          (u.username === 'admin' &&
            password === 'admin123') ||

          (u.username === 'viewer' &&
            password === 'viewer123') ||

          u.passwordHash === `sha256:${hash(password)}`
        );

      if (!ok) {
        return send(res, 401, {
          error: 'Invalid username/email or password.'
        });
      }

      return send(res, 200, {
        token: tokenFor(u.id),
        user: safeUser(u)
      });

    } catch (e) {
      return send(res, 400, {
        error: 'Invalid request.'
      });
    }
  }

  // =========================
  // REGISTER
  // =========================

  if (
    req.method === 'POST' &&
    pathname === '/api/auth/register'
  ) {
    try {
      const b = await readBody(req);

      const name = String(
        b.name || ''
      ).trim();

      const email = String(
        b.email || ''
      ).trim().toLowerCase();

      const username = String(
        b.username || ''
      ).trim().toLowerCase();

      const password = String(
        b.password || ''
      );

      if (
        !name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^[a-z0-9._-]{3,20}$/.test(username) ||
        password.length < 4
      ) {
        return send(res, 400, {
          error:
            'Use a valid email, a 3–20 character username, and a password of at least 4 characters.'
        });
      }

      const db = readDb();

      if (
        db.users.some(
          u => u.username === username
        )
      ) {
        return send(res, 409, {
          error:
            'That username is already registered.'
        });
      }

      if (
        db.users.some(
          u => u.email === email
        )
      ) {
        return send(res, 409, {
          error:
            'That email is already registered.'
        });
      }

      const u = {
        id: `user-${Date.now()}-${crypto
          .randomBytes(3)
          .toString('hex')}`,

        name,
        email,
        username,

        passwordHash:
          `sha256:${hash(password)}`,

        role: 'Viewer',

        createdAt:
          new Date().toISOString()
      };

      db.users.push(u);

      writeDb(db);

      broadcast('users:update', {
        count: db.users.length
      });

      return send(res, 201, {
        token: tokenFor(u.id),
        user: safeUser(u)
      });

    } catch (e) {
      return send(res, 400, {
        error: 'Invalid request.'
      });
    }
  }

  // =========================
  // CONTACT
  // =========================

  if (
    req.method === 'POST' &&
    pathname === '/api/contact'
  ) {
    try {
      const b = await readBody(req);
      const db = readDb();

      const m = {
        id: `msg-${Date.now()}`,

        name: String(
          b.name || ''
        ).trim(),

        email: String(
          b.email || ''
        ).trim(),

        subject: String(
          b.subject || 'Contact request'
        ).trim(),

        message: String(
          b.message || ''
        ).trim(),

        createdAt:
          new Date().toISOString()
      };

      if (
        !m.name ||
        !m.email ||
        !m.message
      ) {
        return send(res, 400, {
          error:
            'Name, email, and message are required.'
        });
      }

      db.contactMessages.unshift(m);

      db.contactMessages =
        db.contactMessages.slice(0, 100);

      writeDb(db);

      broadcast('contact:new', {
        id: m.id,
        createdAt: m.createdAt
      });

      return send(res, 201, {
        ok: true
      });

    } catch (e) {
      return send(res, 400, {
        error: 'Invalid request.'
      });
    }
  }

  // =========================
  // SERVER-SENT EVENTS
  // =========================

  if (
    req.method === 'GET' &&
    pathname === '/api/stream'
  ) {
    res.writeHead(200, {
      'Content-Type':
        'text/event-stream; charset=utf-8',

      'Cache-Control':
        'no-cache, no-transform',

      'Connection':
        'keep-alive',

      'Access-Control-Allow-Origin':
        '*'
    });

    res.write(
      `event: metrics:update\n` +
      `data: ${JSON.stringify(metrics)}\n\n`
    );

    sseClients.add(res);

    const ping = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {}
    }, 15000);

    req.on('close', () => {
      clearInterval(ping);
      sseClients.delete(res);
    });

    return;
  }

  // =========================
  // GEMINI AI CHAT
  // =========================

  if (
    req.method === 'POST' &&
    pathname === '/api/ai/chat'
  ) {
    try {
      const b = await readBody(req);

      const message = String(
        b.message || ''
      ).trim();

      if (!message) {
        return send(res, 400, {
          error: 'Message is required.'
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return send(res, 500, {
          error:
            'Gemini API key is not configured.'
        });
      }

      const ai = await getGeminiAI();

      const contents = `You are the official AI assistant for the "Real-Time Data & Modern Tech" project.

Your job is to explain this specific project accurately to users, students, beginners, project reviewers, and viva examiners.

IMPORTANT RULES:
1. Answer based ONLY on the project information provided below.
2. Do NOT invent features, technologies, databases, APIs, hardware, AI models, security mechanisms, or functionality that are not listed.
3. If something is not specified below, clearly say that it is not specified or not confirmed in the project.
4. Explain technical concepts in simple language unless the user asks for technical detail.
5. If the user asks about the project, give project-specific answers instead of generic textbook answers.
6. Distinguish between actual application functionality and demo/simulated dashboard values.
7. Do not reveal passwords, API keys, tokens, or other secrets.
8. You can explain the project architecture, workflow, technologies, features, and implementation.
9. For viva questions, give short, confident, easy-to-remember answers.
10. Never claim that a feature exists just because it would be useful.

PROJECT INFORMATION:

PROJECT TITLE:
Real-Time Data & Modern Tech

PROJECT PURPOSE:
The project is a web-based platform for centralized, interactive, and user-friendly exploration of modern technologies and real-time data concepts.

TARGET USERS:
Students, beginners, and technology enthusiasts.

TECHNOLOGY STACK:
- HTML5
- CSS3
- JavaScript
- Node.js
- Local Storage
- Chart.js
- Google Gemini AI integration through the @google/genai JavaScript SDK

ARCHITECTURE:
The project follows a basic full-stack web architecture.
- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js
- Data storage: local project data and browser Local Storage for applicable client-side data
- AI: Gemini AI accessed through the Node.js backend
- Real-time updates: Server-Sent Events (SSE)

FRONTEND:
The frontend provides the user interface for the platform.
It includes navigation, dashboard views, feature sections, analytics, data streams, reports, notifications, settings, team information, contact/support information, authentication screens, and an AI chatbot.

BACKEND:
The Node.js backend handles API requests, authentication, contact requests, metrics, Server-Sent Events, and Gemini AI requests.

IMPORTANT BACKEND ROUTES:
- GET /api/health
- GET /api/metrics
- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/register
- POST /api/contact
- GET /api/stream
- POST /api/ai/chat

DATA AND REAL-TIME PROCESSING:
The project includes real-time metric updates using Server-Sent Events (SSE).
The SSE stream updates live metrics approximately every 3 seconds.
The dashboard and related views display real-time-style monitoring information.
Some displayed dashboard values are demo/simulated values and should not be described as real production data unless explicitly stated.

DASHBOARD:
The dashboard displays:
- 128 active streams
- 356 live metrics
- 1.8 TB processed
- 99.9% uptime
- Throughput: 188 Mbps
- Latency: 47 ms
- Cloud sync: 98%
- 3 alerts

ABOUT / PLATFORM INFORMATION:
- 128 data sources
- 7 industries
- 18 AI workflows
- 24/7 coverage
- Monitoring: real-time
- Analytics: predictive
- Automation: event-driven
- Security: role-based

FEATURES:
The project presents 8 capabilities.
Displayed feature information includes:
- Real-time monitoring
- AI insights
- Cloud integration
- Smart automation
- 24/7 automation
- 12 AI models
- Security marked as Enterprise

DATA STREAMS / DEVICES:
The Devices/Data Streams area displays:
- 128 active streams
- 18,420 records per minute
- Average latency: 47 ms
- Health: 99.6%

Displayed stream categories include:
- Telemetry Gateway
- Cloud Events
- IoT Sensors
- Analytics Feed

The project allows Admin users to edit data streams.
Applicable stream data is persisted using browser Local Storage.
Admin users can also adjust metric controls such as throughput and latency.

ANALYTICS:
Analytics displays:
- Data flow: 188 Mbps
- Processing: 94%
- Sync: 98%
- Risk: Low
- 7-day change: +14.8%
- 30-day throughput: +8.2%
- Anomaly rate: 1.4%
- Forecast: +11.6%

ADMIN DASHBOARD:
The Admin dashboard displays:
- 184 users
- 3 admins
- 181 viewers
- 12 active sessions

It includes user, role, and activity information.

USER ROLES:
The project has:
- Admin
- Viewer

Admin users have additional management capabilities such as editing data streams and metric controls.
Viewer users have viewing-oriented access.
Do not claim additional permissions unless specified.

LOGIN AND REGISTRATION:
The project contains login and registration functionality.
Users can authenticate using username or email and password.
The backend validates authentication requests.
The application supports Admin and Viewer roles.
Do not reveal demo passwords or authentication tokens in chatbot responses.

SECURITY:
The security section displays:
- Protection: Active
- Risk: Low
- Failed logins: 2
- Sessions: 3

Displayed security capabilities include:
- Authentication protection
- MFA enabled
- API token validation
- Data encryption at rest and in transit
- Threat monitoring

SETTINGS:
Settings display:
- Theme: Dark
- Refresh: 3 seconds
- Alerts: Enabled
- Access: Session only

The project includes:
- Approximately 3-second auto-refresh behavior
- Notifications enabled
- Detailed dashboard option
- Session-only access information

NOTIFICATIONS:
Notifications display:
- 3 active alerts
- 0 critical alerts
- 2 warnings
- 7 resolved today

Example notification items include:
- Latency threshold
- Cloud snapshot
- Weekly report
- New viewer session

REPORTS:
The project includes report-related functionality in its interface.
Do not claim a specific export format or reporting backend unless it is confirmed in the project implementation.

TEAM:
The project team information includes:
- BASAV SIR — Project Guide
- NAGENDRA REDDY — Project Administrator
- JITHENDRA — Frontend Developer
- SAIKUMAR — Backend/Platform Developer
- RAYHAN — Data & Analytics Developer

CONTACT / SUPPORT:
The contact section displays:
- 3 open tickets
- 7 resolved today
- Average response: 18 minutes
- SLA: 98%

Example tickets:
- API integration — Open / High
- Dashboard customization — In progress / Medium
- Report export — Resolved / Low

AI CHATBOT:
The project integrates Google Gemini AI through the Node.js backend.
The frontend sends a user's question to:
POST /api/ai/chat

The backend sends the request to Gemini and returns the generated response to the frontend.

The chatbot should be able to explain:
- Project overview
- Problem statement
- Objectives
- Technologies
- Architecture
- Frontend
- Backend
- Data handling
- Dashboard
- Analytics
- Real-time updates
- SSE
- Login and registration
- Admin and Viewer roles
- Security
- Data streams
- Notifications
- Settings
- Team
- Contact/support
- AI integration
- Project workflow
- Limitations
- Future enhancements
- Project review and viva questions

PROJECT WORKFLOW:
A typical workflow is:
1. User opens the web application.
2. User views the platform and available sections.
3. User can register or log in.
4. Authentication determines the user's role.
5. User accesses the appropriate dashboard/features.
6. Dashboard and metrics are displayed.
7. Real-time metric updates are delivered through SSE.
8. Admin users can manage applicable data streams and metric controls.
9. Users can view analytics, notifications, settings, team, and contact information.
10. Users can interact with the Gemini AI chatbot.
11. User can log out of the application.

LIMITATIONS / FUTURE ENHANCEMENTS:
Future plans mentioned for the project include:
- Database integration
- Authentication improvements
- Advanced visualization
- Improved search
- Real-time data processing improvements

If asked about limitations, explain that the project is a basic full-stack implementation and some displayed data is demo/simulated data.

USER QUESTION:
${message}`;

      const generateGeminiResponse = (model) =>
        ai.models.generateContent({ model, contents });

      let response;

try {
  response = await generateGeminiResponse('gemini-3.6-flash');
} catch (error) {
  throw error;
}
      return send(res, 200, {
        reply:
          response.text ||
          'I could not generate a response.'
      });

    } catch (error) {
      console.error('Gemini AI request failed.');
      console.error('Gemini error name:', error?.name || 'UnknownError');
      console.error('Gemini error status/code:', error?.status ?? error?.code ?? 'Unavailable');
      console.error('Gemini error message:', error?.message || 'No message available');

      return send(res, 500, {
        error:
          'Gemini AI request failed.'
      });
    }
  }

  // =========================
  // UNKNOWN API ROUTE
  // =========================

  if (pathname.startsWith('/api/')) {
    return send(res, 404, {
      error: 'API route not found.'
    });
  }

  // =========================
  // STATIC FILES
  // =========================

  let filePath =
    pathname === '/'
      ? path.join(ROOT, 'index.html')
      : path.join(ROOT, pathname);

  if (!filePath.startsWith(ROOT)) {
    filePath = path.join(ROOT, 'index.html');
  }

  if (
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath);

  res.writeHead(200, {
    'Content-Type':
      MIME[ext] ||
      'application/octet-stream',

    'Cache-Control':
      'no-store'
  });

  fs.createReadStream(filePath).pipe(res);
}

// =========================
// START REAL-TIME UPDATES
// =========================

setInterval(tick, 3000);

// =========================
// CREATE SERVER
// =========================

const server = http.createServer(
  (req, res) => {
    handle(req, res).catch(e => {
      console.error(
        'Server error:',
        e
      );

      send(res, 500, {
        error: 'Server error.'
      });
    });
  }
);

// =========================
// START SERVER
// =========================

server.listen(
  PORT,
  () => {
    console.log(
      `Real-Time Data project running at http://localhost:${PORT}`
    );
  }
);