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
- Multermate for file uploads
- Joi for request validation
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB database
- pnpm, npm, or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wasim-zaman/ott_backend.git project-name
   cd project-name
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   MONGODB_URI="mongodb://username:password@localhost:27017/your_database"
   JWT_SECRET="your_jwt_secret"
   PORT=3000
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="your_admin_password"
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The server should now be running on `http://localhost:3000`.

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at:
`http://localhost:3000/api-docs`

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
