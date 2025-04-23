# Real-Time Chat Application

A modern real-time chat application built with Django and React, featuring WebSocket communication for real-time messaging.

## Features
- Real-time chat functionality using Django Channels
- User authentication and authorization
- Message persistence with PostgreSQL
- Modern React frontend with real-time updates
- Containerized with Docker for easy deployment

## Tech Stack
- **Backend:**
  - Django
  - Django REST Framework
  - Django Channels (WebSocket)
  - PostgreSQL
  - Daphne (ASGI server)

- **Frontend:**
  - React
  - Vite
  - Nginx (production server)

## Prerequisites
Choose either Docker or local development setup:

### Docker Setup (Recommended)
- Docker
- Docker Compose
- PostgreSQL (local or remote)

### Local Development
- Python 3.11+
- Node.js 18+
- npm 9+
- PostgreSQL

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. Configure your PostgreSQL connection:
   - Update the `DATABASE_URL` in `docker-compose.yml`
   - Make sure PostgreSQL is running and accessible

3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Development Setup

### Backend Setup
1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Images
Pre-built Docker images are available on Docker Hub:
- Backend: `markhill97/chat-backend:1.0`
- Frontend: `markhill97/chat-frontend:1.0`

To use the pre-built images, uncomment the image lines in `docker-compose.yml`.

## Configuration

### Environment Variables
- Backend (`.env`):
  - `DEBUG`: Enable/disable debug mode
  - `DATABASE_URL`: PostgreSQL connection URL
  - `DJANGO_ALLOWED_HOSTS`: Allowed hosts for Django
  - `CORS_ALLOWED_ORIGINS`: CORS allowed origins

- Frontend:
  - `VITE_API_URL`: Backend API URL

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
MIT License
