import { Router } from 'express';
import { createProject, getProjects, getMyProjects } from '../controllers/project.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Publicly visible projects (for Agents to browse)
router.get('/', authenticateToken, getProjects);

// Developer specific routes
router.post('/', authenticateToken, authorizeRole(['DEVELOPER_ADMIN']), createProject);
router.get('/my', authenticateToken, authorizeRole(['DEVELOPER_ADMIN']), getMyProjects);

export default router;
