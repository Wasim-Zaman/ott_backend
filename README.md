# Movie Management API

## Overview

This project is a robust Movie Management API built with Node.js, Express, and Prisma ORM. It provides a comprehensive set of endpoints for managing movies, categories, and user authentication. The API supports features such as CRUD operations for movies and categories, user registration and authentication, and file uploads for movie images and videos.

## Features

- User authentication (registration, login, logout)
- Movie management (create, read, update, delete)
- Category management (create, read, update, delete)
- File uploads for movie images and videos
- Pagination and search functionality for movies
- Swagger documentation for easy API exploration

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads
- Joi for request validation
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/movie-management-api.git
   cd movie-management-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
   JWT_SECRET="your_jwt_secret"
   PORT=3000
   ```

4. Run database migrations:

   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run dev
   ```

The server should now be running on `http://localhost:3000`.

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at:

This interface provides detailed information about all available endpoints, request/response schemas, and allows you to test the API directly from the browser.

## Main Endpoints

- **Authentication**

  - POST `/api/auth/v1/register`: Register a new user
  - POST `/api/auth/v1/login`: Login user
  - POST `/api/auth/v1/logout`: Logout user

- **Movies**

  - GET `/api/movie/v1/movie`: Get all movies (with pagination and search)
  - POST `/api/movie/v1/movie`: Create a new movie
  - GET `/api/movie/v1/movie/:id`: Get a specific movie
  - PUT `/api/movie/v1/movie/:id`: Update a movie
  - DELETE `/api/movie/v1/movie/:id`: Delete a movie

- **Categories**
  - GET `/api/category/v1/category`: Get all categories
  - POST `/api/category/v1/category`: Create a new category
  - GET `/api/category/v1/category/:id`: Get a specific category
  - PUT `/api/category/v1/category/:id`: Update a category
  - DELETE `/api/category/v1/category/:id`: Delete a category

## Data Models

### User

- id (UUID)
- name (String)
- email (String, unique)
- password (String)
- createdAt (DateTime)
- updatedAt (DateTime)

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
