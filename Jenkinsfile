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
}