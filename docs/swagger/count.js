/**
 * @swagger
 * tags:
 *   name: Counts
 *   description: Get total counts of all entities
 */

/**
 * @swagger
 * /api/counts/v1:
 *   get:
 *     summary: Get total counts of all entities
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Counts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     movies:
 *                       type: integer
 *                       example: 25
 *                     categories:
 *                       type: integer
 *                       example: 8
 *                     banners:
 *                       type: integer
 *                       example: 5
 *                     users:
 *                       type: integer
 *                       example: 100
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
