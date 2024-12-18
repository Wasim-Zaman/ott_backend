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
 *         - imageUrl
 *         - videoType
 *         - videoUrl
 *         - categoryId
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
 *           description: The URL of the movie image (auto-generated from upload)
 *         videoType:
 *           type: string
 *           enum: [UPLOAD, LINK]
 *           description: Whether the video is uploaded or linked externally
 *         videoUrl:
 *           type: string
 *           description: The URL of the video (either uploaded path or external link)
 *         status:
 *           type: string
 *           enum: [PUBLISHED, PENDING]
 *           default: PENDING
 *           description: The publication status of the movie
 *         categoryId:
 *           type: string
 *           description: The ID of the category the movie belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *             required:
 *               - name
 *               - description
 *               - videoType
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (required)
 *               videoType:
 *                 type: string
 *                 enum: [UPLOAD, LINK]
 *               movie:
 *                 type: string
 *                 format: binary
 *                 description: Required when videoType is UPLOAD
 *               videoUrl:
 *                 type: string
 *                 description: Required when videoType is LINK
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, PENDING]
 *                 default: PENDING
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid input or missing required files
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/movie/v1/movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalMovies:
 *                   type: integer
 *       404:
 *         description: No movies found
 */

/**
 * @swagger
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
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *   put:
 *     summary: Update a movie
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
 *               videoType:
 *                 type: string
 *                 enum: [UPLOAD, LINK]
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Required when changing to UPLOAD type
 *               videoUrl:
 *                 type: string
 *                 description: Required when changing to LINK type
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, PENDING]
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid input or missing required files
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Movie not found
 *   delete:
 *     summary: Delete a movie
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
 */
