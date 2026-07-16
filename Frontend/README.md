# CloudMosaic - Enterprise Cloud & HR Solutions Frontend

CloudMosaic is a high-performance, modern, and accessible React single-page application (SPA) offering enterprise cloud migration, digital transformation, custom software tool development, and business HR consulting services.

This frontend is production-ready, SEO-optimized, highly accessible (a11y), and designed for seamless integration with a Django + Django REST Framework (DRF) backend.

---

## 🚀 Key Features

- **Comprehensive Route Structure**: Built with React Router, featuring lazy-loaded pages and code splitting for optimal bundle sizes.
- **Dynamic Utilities**: Includes an interactive **Service Match Quiz** and a custom **ROI Cloud Migration Calculator**.
- **Contact Hub Widget**: Persistent float-action button providing direct access to a mock scheduling wizard and a simulation chatbot.
- **Robust Error Handling**: Customized React Error Boundary wrapper that captures runtime exceptions and displays a fallback UI.
- **Global Toast Notification Context**: A context-driven alert notification provider supporting success, error, info, and warning states.
- **A11y & SEO Optimization**: Full accessibility enhancements (ARIA labels, keyboard focus visibility, semantic tags) and search optimization (React Helmet, JSON-LD Schema markup, custom `robots.txt`, and `sitemap.xml`).

---

## 🛠️ Tech Stack

- **Framework**: React 19 (React-Scripts)
- **Routing**: React Router (HashRouter)
- **Styling**: Vanilla CSS (TailwindCSS avoided for custom visual consistency)
- **State & Notifications**: Custom React Context Providers
- **Testing**: Jest & React Testing Library (with text encoder and scroll polyfills)

---

## 📁 Folder Structure

```text
src/
├── components/          # Reusable components
│   ├── common/          # Loaders, SkeletonLoader, EmptyState, ErrorState, NoData
│   ├── ContactHub/      # Scheduler widget and chatbot
│   ├── Header.js        # Responsive main navbar
│   └── Footer.js        # Site footer with newsletter form
├── context/             # Global Context Providers (e.g., NotificationContext)
├── pages/               # Route components (Home, Services, Careers, Testimonials, etc.)
├── services/            # API client service layer (api.js)
├── styles/              # Vanilla CSS stylesheets
├── utils/               # Reusable helpers (calculators, validators)
└── App.js               # Application Shell (Routes, Suspense boundaries)
```

---

## ⚙️ Environment Variables

Copy the template from `.env.example` to create your local `.env` configuration:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

| Variable | Purpose | Default / Example Value |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base URL of the Django backend API | `https://api.cloudmosaic.ai` (Mock fallback) |
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS Service Identifier (if applicable) | `your_service_id` |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | EmailJS Template Identifier (if applicable) | `your_template_id` |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS Public API Key (if applicable) | `your_public_key` |

---

## 📦 Installation & Setup

1. **Install Dependencies**:
   Install all project dependencies using legacy peer dependencies to support React 19 configurations:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run Local Development Server**:
   Start the local dev environment at `http://localhost:3000/cloudmosaic-react`:
   ```bash
   npm start
   ```

3. **Run Test Suites**:
   Execute Jest tests in watch mode:
   ```bash
   npm test
   ```

---

## 🏗️ Build & Deployment

### Production Build
To compile the static production bundle to the `build/` folder:
```bash
npm run build
```

### GitHub Pages Deployment
The project is configured for automated builds and deployment on GitHub Pages. To publish changes:
```bash
npm run deploy
```

---

## 🔗 Backend Integration Readiness

The frontend contains an API client service in `src/services/api.js` equipped with mock delays and promise returns to simulate server interaction. To connect the real Django backend:
1. Swap out mock payloads with standard HTTP requests (`fetch` or `axios`).
2. Integrate the dynamic actions in the corresponding endpoints:
   - **Newsletter**: `POST /api/newsletter/`
   - **Contact Form**: `POST /api/contact/`
   - **Careers / Job Apply**: `POST /api/careers/apply/` (supporting file attachment/resumes)
   - **Reviews / Testimonials**: `POST /api/reviews/`
   - **Contact Hub Scheduler**: `POST /api/scheduler/`
