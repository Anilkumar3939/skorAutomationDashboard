# Skor Automation Dashboard

A modern, dashboard-driven test automation interface.

## Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL

## Onboarding for New Users

To run this project locally, follow these steps:

### 1. Database Setup
You need a running PostgreSQL instance. 
1.  **Install PostgreSQL** if you haven't already.
2.  **Create a Database:** 
    - Open your PostgreSQL tool (like pgAdmin or `psql`).
    - Run the command: `CREATE DATABASE automation_dashboard;`
3.  **Configure Environment:**
    - Navigate to `skor-dashboard/server/`.
    - Create a new file named `.env`.
    - Add the following configuration (replace with your local PostgreSQL credentials):
      ```env
      DATABASE_URL=postgres://<username>:<password>@localhost:5432/automation_dashboard
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=465
      SMTP_USER=your_email@gmail.com
      SMTP_PASS=your_app_password
      ```

### 2. Initializing the Database
The application is designed to automatically create the necessary tables the first time the server starts. Once you have set up your `.env` file and started the server using `npm run server`, the backend will connect to your PostgreSQL instance and run the initialization scripts automatically.

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

1. **Install Dependencies:**
   - Backend/Dashboard: `cd skor-dashboard && npm install`
   - Python: `pip install -r test_automation/requirements.txt`

2. **Start the Backend:**
   ```bash
   cd skor-dashboard
   npm run server
   ```

3. **Start the Frontend:**
   ```bash
   cd skor-dashboard
   npm run dev
   ```

4. **Running Tests:**
   - Use the Dashboard UI to trigger a suite.
   - The backend will automatically execute the corresponding `pytest` files, generate Allure reports, and sync results into PostgreSQL.
