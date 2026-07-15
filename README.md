# Skor Automation Dashboard

A modern, dashboard-driven test automation interface.

## Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL

## Setup

1. **Database Setup**
   - Create a PostgreSQL database named `automation_dashboard`.
   - Create a `.env` file in `skor-dashboard/server/` with the following variables:
     ```env
     DATABASE_URL=postgres://user:password@localhost:5432/automation_dashboard
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=465
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_app_password
     ```

2. **Install Dependencies**
   - Backend/Dashboard: `cd skor-dashboard && npm install`
   - Python: `pip install -r test_automation/requirements.txt`

## Supported Test Suites

The following test suites are integrated into the dashboard:

1. `test_registration_login.py`
2. `test_otp.py`
3. `test_onboarding.py`
4. `test_pre_uw_loading.py`
5. `test_pre_approved.py`
6. `test_verify_email.py`
7. `test_onboarding_extended.py`
8. `test_delivery_page.py`

## Running the Application

1. **Start the Backend:**
   ```bash
   cd skor-dashboard
   npm run server
   ```

2. **Start the Frontend:**
   ```bash
   cd skor-dashboard
   npm run dev
   ```

3. **Running Tests:**
   - Use the Dashboard UI to trigger a suite.
   - The backend will automatically execute the corresponding `pytest` files, generate Allure reports, and sync results into PostgreSQL.
