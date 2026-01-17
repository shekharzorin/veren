import { Router } from 'express';
import { createProject, getProjects, getMyProjects, joinProject } from '../controllers/project.controller';
import { generateProjectPDF } from '../controllers/ProjectPDFController';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Publicly visible projects (for Agents to browse)
router.get('/', authenticateToken, getProjects);
router.post('/join', authenticateToken, authorizeRole(['AGENT', 'BROKERAGE_ADMIN']), joinProject);
router.get('/:id/pdf', authenticateToken, generateProjectPDF);

// Developer specific routes
router.post('/', authenticateToken, authorizeRole(['DEVELOPER_ADMIN']), createProject);
router.get('/my', authenticateToken, authorizeRole(['DEVELOPER_ADMIN']), getMyProjects);

export default router;
