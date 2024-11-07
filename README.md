# Movie Management API

## Overview

This project is a robust Movie Management API built with Node.js, Express, and Mongoose. It provides a comprehensive set of endpoints for managing movies, categories, users, banners, and admin authentication. The API supports features such as CRUD operations for movies, categories, users, and banners, as well as file uploads for images and videos.

## Features

- Admin authentication (login)
- User management (create, read, update, delete)
- Movie management (create, read, update, delete)
- Category management (create, read, update, delete)
- Banner management (create, read, update, delete)
- Statistics (get counts of all entities)
- File uploads for images and videos
- Pagination and search functionality
- Swagger documentation for easy API exploration

## Tech Stack

- Node.js
- Express.js
- Mongoose (for MongoDB)
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads
- Joi for request validation
- Swagger for API documentation
- Docker for containerization

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wasim-zaman/ott_backend.git
   cd ott_backend
   ```

2. Create `.env` file in the root directory:

   ```env
   PORT=4080
   JWT_SECRET=your_jwt_secret
   MONGO_INITDB_ROOT_USERNAME=root
   MONGO_INITDB_ROOT_PASSWORD=your_password
   ADMIN_EMAIL="admin@ott.com"
   ADMIN_PASSWORD="admin"
   DOMAIN="your_domain"
   LOCAL_HOST="http://localhost:4080"
   EMAIL="your_email@example.com"
   ```

3. Start the application using Docker:
   ```bash
   docker-compose up -d --build
   ```

The server will be running on `http://localhost:4080`

### Running Without Docker

If you prefer to run without Docker:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
├── app.js
├── routes/
├── controllers/
├── models/
├── middleware/
├── uploads/
└── ...
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at:
`http://localhost:4080/api-docs`

## Main Endpoints

### Admin Authentication

- POST `/api/admin/v1/login`: Login admin

### Users

- GET `/api/user/v1/users`: Get all users
- POST `/api/user/v1/user`: Create a new user
- GET `/api/user/v1/user/:id`: Get a specific user
- PUT `/api/user/v1/user/:id`: Update a user
- DELETE `/api/user/v1/user/:id`: Delete a user

### Movies

- GET `/api/movie/v1/movies`: Get all movies (with pagination and search)
- POST `/api/movie/v1/movie`: Create a new movie
- GET `/api/movie/v1/movie/:id`: Get a specific movie
- PUT `/api/movie/v1/movie/:id`: Update a movie
- DELETE `/api/movie/v1/movie/:id`: Delete a movie

### Categories

- GET `/api/category/v1/categories`: Get all categories
- POST `/api/category/v1/category`: Create a new category
- GET `/api/category/v1/categories/paginated`: Get paginated categories

### Banners

- GET `/api/banner/v1/banners`: Get all banners
- POST `/api/banner/v1/banner`: Create a new banner
- GET `/api/banner/v1/banner/:id`: Get a specific banner
- PUT `/api/banner/v1/banner/:id`: Update a banner
- DELETE `/api/banner/v1/banner/:id`: Delete a banner

### Statistics

- GET `/api/counts/v1`: Get total counts of all entities

## Data Models

### Admin

- id (UUID)
- email (String, unique)
- password (String)

### User

- id (UUID)
- name (String)
- email (String, unique)
- password (String)
- status (Enum: ACTIVE, INACTIVE, BLOCKED)
- image (String, optional)

### Movie

- id (UUID)
- name (String)
- description (String)
- imageUrl (String, optional)
- videoLink (String, optional)
- source (String)
- status (Enum: PUBLISHED, PENDING)
- createdAt (DateTime)
- updatedAt (DateTime)
- categoryId (UUID, foreign key to Category)

### Category

- id (UUID)
- name (String, unique)
- imageUrl (String, optional)

### Banner

- id (UUID)
- image (String)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Docker Configuration

### Services

1. **API Service (ott-api)**

   - Node.js application
   - Runs on port specified in .env
   - Auto-reload enabled in development

2. **MongoDB Service**
   - Latest MongoDB image
   - Persistent data storage
   - Secured with authentication

### Volumes

- `data`: Persistent MongoDB data
- `uploads`: Persistent storage for uploaded files
- Local volume mapping for development

## Development

For development, the application supports hot-reloading through nodemon. Any changes to the source code will automatically restart the server.

### Docker Commands

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```
