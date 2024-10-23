# Movie Management API

## Overview

This project is a robust Movie Management API built with Node.js, Express, and Prisma ORM. It provides a comprehensive set of endpoints for managing movies, categories, users, banners, and admin authentication. The API supports features such as CRUD operations for movies, categories, users, and banners, as well as file uploads for images and videos.

## Features

- Admin authentication (login)
- User management (create, read, update, delete)
- Movie management (create, read, update, delete)
- Category management (create, read, update, delete)
- Banner management (create, read, update, delete)
- File uploads for images and videos
- Pagination and search functionality
- Swagger documentation for easy API exploration

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JSON Web Tokens (JWT) for authentication
- Multermate for file uploads
- Joi for request validation
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MySQL database
- pnpm, npm or yarn package manager

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/wasim-zaman/movie-management-api.git
   cd movie-management-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:3306/your_database"
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

- **Admin Authentication**

  - POST `/api/admin/v1/login`: Login admin

- **Users**

  - GET `/api/user/v1/users`: Get all users
  - POST `/api/user/v1/user`: Create a new user
  - GET `/api/user/v1/user/:id`: Get a specific user
  - PUT `/api/user/v1/user/:id`: Update a user
  - DELETE `/api/user/v1/user/:id`: Delete a user

- **Movies**

  - GET `/api/movie/movies`: Get all movies (with pagination and search)
  - POST `/api/movie/movie`: Create a new movie
  - GET `/api/movie/movie/:id`: Get a specific movie
  - PUT `/api/movie/movie/:id`: Update a movie
  - DELETE `/api/movie/movie/:id`: Delete a movie

- **Categories**

  - GET `/api/category/v1/categories`: Get all categories
  - POST `/api/category/v1/category`: Create a new category
  - GET `/api/category/v1/categories/paginated`: Get paginated categories

- **Banners**
  - GET `/api/banner/v1/banners`: Get all banners
  - POST `/api/banner/v1/banner`: Create a new banner
  - GET `/api/banner/v1/banners/paginated`: Get paginated banners
  - GET `/api/banner/v1/banner/:id`: Get a specific banner
  - PUT `/api/banner/v1/banner/:id`: Update a banner
  - DELETE `/api/banner/v1/banner/:id`: Delete a banner

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
