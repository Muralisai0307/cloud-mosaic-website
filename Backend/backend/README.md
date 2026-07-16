# Cloud Mosaic Backend Service

Welcome to the Cloud Mosaic backend service. This repository holds the Python-based REST API backend built on Django, Django REST Framework, and MySQL, designed for scalable enterprise performance.

---

## 🏛️ Project Architecture & Design

The backend uses a **modular architecture** design separating routing configuration (`config/`) from functional business capability domains (`apps/`).

### App Layering
- **`config/`**: System-wide router, URL endpoint definitions, configuration matrices, and environment settings.
- **`apps/`**: Domain specific business contexts (e.g. `accounts`, `careers`, `blog`). Each app is a self-contained Django module structure keeping functionality highly decoupled.
- **`requirements/`**: Partitioned dependencies to keep development environments distinct from production.

---

## 📁 Directory Structure

```text
backend/
│
├── config/                  # Django project configuration root
│   ├── settings/            # Modularized configuration settings
│   │   ├── base.py          # Core shared configuration
│   │   ├── development.py   # Development-specific overrides
│   │   ├── production.py    # Production-grade settings & policies
│   │   └── __init__.py
│   ├── urls.py              # Main URL route router
│   ├── asgi.py              # Asynchronous Server Gateway entrypoint
│   ├── wsgi.py              # WSGI gateway entrypoint
│   └── __init__.py
│
├── apps/                    # Business context applications directory
│   ├── accounts/            # User authentication and profile contexts
│   ├── contact/             # Contact/lead generation handler
│   ├── newsletter/          # Newsletter subscription contexts
│   ├── careers/             # Jobs and job application system
│   ├── services/            # Service descriptions and portfolios
│   ├── testimonials/        # Client testimonial contexts
│   ├── blog/                # Articles, tags, and publications
│   ├── faq/                 # FAQ sections
│   ├── meetings/            # Consulting scheduler integrations
│   ├── common/              # Helper cross-app classes / utilities
│   └── core/                # Global core components, base models
│
├── media/                   # User-uploaded assets (ignored by Git)
├── static/                  # Collected static assets (ignored by Git)
├── templates/               # Custom system templates / templates boilerplate
├── logs/                    # Local runtime log dumps (ignored by Git)
│
├── requirements/            # Dependency control files
│   ├── base.txt             # Core platform requirements
│   ├── development.txt      # Formatting/linting dev tools
│   └── production.txt       # Production execution list
│
├── scripts/                 # Utility scripts (database setups, backups, seeding)
├── .env                     # Current active environment configuration (ignored by Git)
├── .env.example             # Template schema for deployment environment configuration
├── .gitignore               # System, cache, and platform ignores
├── manage.py                # Command-line administrative manager
├── pyproject.toml           # Tool configs for formatting (black, isort)
├── .flake8                  # Lint rules configuration
└── README.md                # This manual
```

---

## 🛠️ Installation & Bootstrapping

Follow these steps to configure your local development workspace:

### 1. Prerequisite Checks
Ensure you have the following installed:
- Python 3.13+
- MySQL (Optional if using SQLite local dev fallback)

### 2. Configure Virtual Environment
Initialize a virtual environment in the `backend/` directory:
```bash
python -m venv .venv
```

Activate the environment:
- **Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **Linux / macOS:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
Install development packages:
```bash
pip install --upgrade pip
pip install -r requirements/development.txt
```

### 4. Setup Environment Config
Copy the example environment file and edit values as needed:
```bash
cp .env.example .env
```

---

## ⚙️ Environment Variables

The application reads configuration parameters from the environment. Below are the key environment configurations:

| Key | Description | Development Default |
|-----|-------------|---------------------|
| `SECRET_KEY` | Security signing key. | `django-insecure-development-key-for-cloud-mosaic-backend` |
| `DEBUG` | Enable verbose debugging exceptions. | `True` |
| `ALLOWED_HOSTS` | Hosts allowed to query the service. | `localhost,127.0.0.1` |
| `USE_SQLITE` | Set to `True` to fallback to SQLite for local bootstrap. | `False` |
| `DB_NAME` | MySQL database name. | `cloud_mosaic_db` |
| `DB_USER` | MySQL database username. | `root` |
| `DB_PASSWORD` | MySQL database password. | ` ` |
| `DB_HOST` | Database host. | `127.0.0.1` |
| `DB_PORT` | Database port. | `3306` |
| `CORS_ALLOWED_ORIGINS` | Permitted origins for CORS requests. | `http://localhost:3000,http://127.0.0.1:3000` |
| `TIME_ZONE` | Localization timezone. | `Asia/Kolkata` |

---

## 🚀 Running Locally

Once configured, verify you can run migrations and execute the web server:

### Run Server Check
```bash
python manage.py check
```

### Start Server
```bash
python manage.py runserver
```
The server will boot locally at `http://127.0.0.1:8000/`.

### API Documentation (OpenAPI / Swagger UI)
With the server running, navigate to:
- **Swagger Interactive Docs**: `http://127.0.0.1:8000/api/docs/`
- **ReDoc Static Schema**: `http://127.0.0.1:8000/api/redoc/`
- **Raw OpenAPI Spec**: `http://127.0.0.1:8000/api/schema/`

---

## 📦 Production Deployment

For production deployments, execute the following parameters:

1. **Settings Module**: Set the settings environment variable:
   ```bash
   export DJANGO_SETTINGS_MODULE=config.settings.production
   ```
2. **Collect Static Files**: Gather static files into static folder for WhiteNoise to compress and serve:
   ```bash
   python manage.py collectstatic --noinput
   ```
3. **WSGI Server**: Run the application under Gunicorn:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

---

## 🎨 Coding Standards & Code Quality

To maintain clean and uniform code across the backend, we run formatting tools pre-configured under `pyproject.toml` and `.flake8`:

### 1. Code Formatting (Black)
Format source code using:
```bash
black .
```

### 2. Import Sorting (isort)
Align imports layout using:
```bash
isort .
```

### 3. Linting Checks (Flake8)
Verify styling rules compatibility:
```bash
flake8 .
```

---

## 📊 Database Entity Relationship Diagram (ERD)
The complete Entity Relationship Diagram (ERD) detailing all custom business tables and constraints is available here:
- [ER_DIAGRAM.md](file:///c:/Users/mural/OneDrive/Desktop/Backend/backend/docs/ER_DIAGRAM.md)

