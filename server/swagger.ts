/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: arc.sid
 * 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, OPERATOR, USER]
 *     
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *         uptime:
 *           type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     FinanceOverview:
 *       type: object
 *       properties:
 *         totalBudget:
 *           type: number
 *         spent:
 *           type: number
 *         remaining:
 *           type: number
 *     
 *     SecurityEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *         severity:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     Agent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *         tier:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [ACTIVE, IDLE, OFFLINE]
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         statusCode:
 *           type: integer
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/finance/overview:
 *   get:
 *     summary: Get finance overview
 *     tags: [Finance]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Finance overview data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinanceOverview'
 */

/**
 * @swagger
 * /api/security/events:
 *   get:
 *     summary: Get security events
 *     tags: [Security]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: List of security events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SecurityEvent'
 */

/**
 * @swagger
 * /api/arc/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [ARC]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 */

/**
 * @swagger
 * /api/arc/chat/status:
 *   get:
 *     summary: Get chat service status
 *     tags: [ARC]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Chat service status
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System metrics data
 */
