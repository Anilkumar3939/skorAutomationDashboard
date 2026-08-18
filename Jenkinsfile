pipeline {
    agent any

    stages {

        stage('Install Playwright') {
            steps {
                dir('playwright-web') {
                    bat 'npm ci'
                    bat 'npx playwright install'
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                dir('playwright-web') {
                    bat 'npx playwright test'
                }
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-web/playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
        }
    }
}