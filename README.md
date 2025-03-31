# Django React User Management System

Repository: [https://github.com/faizan1041/django-react-claude](https://github.com/faizan1041/django-react-claude)

A full-stack boilerplate application with complete user management functionality including authentication, permissions, and group management.

## Features

- **User Authentication**
  - JWT-based authentication
  - Login and registration
  - Password reset
  - Session management

- **User Management**
  - Create, read, update, delete users
  - User activation/deactivation
  - Profile management

- **Permissions System**
  - Role-based access control
  - Group management
  - Permission assignment

- **Modern Technology Stack**
  - Django 4.2 backend with REST API
  - React 18 frontend with functional components and hooks
  - PostgreSQL database
  - Docker containerization

## System Architecture

The application follows a clean architecture with separation of concerns:

- **Backend (Django)**
  - REST API using Django Rest Framework
  - JWT authentication with Simple JWT
  - Custom user model with email as username
  - Comprehensive test coverage

- **Frontend (React)**
  - Modern React with hooks and context API
  - Responsive UI with Tailwind CSS
  - Form management with Formik and Yup
  - Protected routes based on authentication status and permissions

- **DevOps**
  - Docker containers for consistent development and deployment
  - Docker Compose for orchestration
  - Environment variable configuration

## Project Structure

```
project-root/
├── backend/               # Django backend
│   ├── core/              # Core Django settings
│   ├── users/             # User management app
│   ├── static/            # Static files
│   ├── media/             # User-uploaded files
│   ├── Dockerfile         # Backend Docker configuration
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   ├── Dockerfile         # Frontend Docker configuration
│   └── package.json       # NPM dependencies
└── docker-compose.yml     # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/faizan1041/django-react-claude.git
   cd django-react-claude
   ```

2. Start the application with Docker Compose
   ```bash
   docker-compose up
   ```

3. Create a superuser for the Django admin
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Admin interface: http://localhost:8000/admin/
   - API documentation: http://localhost:8000/swagger/

### Development Workflow

1. Make changes to the frontend or backend code
2. Docker will automatically reload both applications
3. Run tests to ensure code quality
   ```bash
   # Backend tests
   docker-compose exec backend python manage.py test

   # Frontend tests
   docker-compose exec frontend npm test
   ```

## API Endpoints

### Authentication
- `POST /api/auth/jwt/create/` - Obtain JWT token
- `POST /api/auth/jwt/refresh/` - Refresh JWT token
- `POST /api/auth/users/` - Register new user
- `POST /api/auth/users/reset_password/` - Reset password
- `POST /api/auth/users/reset_password_confirm/` - Confirm password reset

### User Management
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Create user (admin only)
- `GET /api/users/{id}/` - Retrieve user details (admin only)
- `PATCH /api/users/{id}/` - Update user (admin only)
- `DELETE /api/users/{id}/` - Delete user (admin only)
- `POST /api/users/{id}/set_groups/` - Set user groups (admin only)
- `POST /api/users/{id}/set_permissions/` - Set user permissions (admin only)

### Group Management
- `GET /api/users/groups/` - List groups (admin only)
- `POST /api/users/groups/` - Create group (admin only)
- `GET /api/users/groups/{id}/` - Retrieve group details (admin only)
- `PATCH /api/users/groups/{id}/` - Update group (admin only)
- `DELETE /api/users/groups/{id}/` - Delete group (admin only)
- `POST /api/users/groups/{id}/set_permissions/` - Set group permissions (admin only)

### Permissions
- `GET /api/users/permissions/` - List all permissions (admin only)

## Security Considerations

- JWT tokens with appropriate expiration
- CORS configuration to prevent unauthorized access
- Password validation and hashing
- Permission-based access control
- CSRF protection
- Admin-only access to user management

## Deployment

For production deployment:

1. Update the environment variables in docker-compose.yml:
   - Set `DEBUG=0`
   - Change `SECRET_KEY` to a secure value
   - Update `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`

2. Set up a proper database backup strategy

3. Configure HTTPS with a reverse proxy (Nginx, etc.)

4. Set up CI/CD pipelines for automated testing and deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Django Rest Framework
- React and Create React App
- Tailwind CSS
- Formik and Yup
- Djoser for user management
- Simple JWT for authentication