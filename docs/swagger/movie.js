/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the movie
 *         name:
 *           type: string
 *           description: The name of the movie
 *         description:
 *           type: string
 *           description: The description of the movie
 *         imageUrl:
 *           type: string
 *           description: The URL of the movie image
 *         videoLink:
 *           type: string
 *           description: The URL of the movie video or external link
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the movie was added
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the movie was last updated
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /api/movie/v1/movie:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               movie:
 *                 type: string
 *                 format: binary
 *               videoLink:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all movies with pagination
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for name or description
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *       404:
 *         description: No movies found
 *
 * /api/movie/v1/movie/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie found successfully
 *       404:
 *         description: Movie not found
 *
 *   put:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               movie:
 *                 type: string
 *                 format: binary
 *               videoLink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Movie not found
 *
 *   delete:
 *     summary: Delete a movie by ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Movie not found
 *
 * /api/movie/v1/movies/paginated:
 *   get:
 *     summary: Get paginated movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *       404:
 *         description: No movies found
 */
