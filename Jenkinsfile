pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                bat '''
                    cd skor-dashboard
                    npm ci
                '''
            }
        }

        stage('Install Playwright Dependencies') {
            steps {
                bat '''
                    cd playwright-web
                    npm ci
                    npx playwright install
                '''
            }
        }

        stage('Start Backend') {
            steps {
                bat '''
                    cd skor-dashboard
                    start "Backend" /B cmd /c "npm run server > server.log 2>&1"
                '''
            }
        }

        stage('Start Frontend') {
            steps {
                bat '''
                    cd skor-dashboard
                    start "Frontend" /B cmd /c "npm run dev > frontend.log 2>&1"
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat '''
                    cd playwright-web
                    npm test
                '''
            }
        }
    }

    post {
        always {
            echo 'Playwright execution completed'
        }

        success {
            echo 'All tests passed'
        }

        failure {
            echo 'Some tests failed'
        }
    }
}