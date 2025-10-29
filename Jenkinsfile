pipeline{
    agent any
    tools{
        maven 'maven' 
    }
    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds' 
        DOCKERHUB_USERNAME       = 'eagowri'
        IMAGE_NAME               = "${env.DOCKERHUB_USERNAME}/my-app"
        CONTAINER_NAME           = "my-app-container"
    }
    stages{
        stage('Github src') {
            steps {
                echo 'Checking out source code...'
                git branch: 'master', url: 'https://github.com/gowri-ea/myntra-maven-report'
            }
        }

        stage('Build stage'){
            steps{
                echo 'Building with Maven...'
                sh 'mvn clean package'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                sh "sudo docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | sudo docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Tag and Push Docker Image') {
            steps {
                script {
                    echo "Pushing image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                    sh "sudo docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                    
                    echo "Tagging as 'latest'..."
                    sh "sudo docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"
                    
                    echo "Pushing 'latest' tag..."
                    sh "sudo docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Remove Local Docker Image') {
            steps {
                echo "Removing local image: ${IMAGE_NAME}:${BUILD_NUMBER}"
                sh "sudo docker rmi ${IMAGE_NAME}:${BUILD_NUMBER}"
            }
        }

        stage('Run Container') {
            steps {
                echo "Running new container ${CONTAINER_NAME} on port 8084..."
                sh "sudo docker stop ${CONTAINER_NAME} || true"
                sh "sudo docker rm ${CONTAINER_NAME} || true"
                sh "sudo docker run -d -p 8084:8080 --name ${CONTAINER_NAME} ${IMAGE_NAME}:latest"
            }
        }
    }
    post {
        always {
            echo 'This will always run after the stages are complete.'
        }
        success {
            echo 'This will run only if the pipeline succeeds.'
        }
        failure {
            echo 'This will run only if the pipeline fails.'
        }
    }
}