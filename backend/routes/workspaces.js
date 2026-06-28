const express = require('express');
const router = express.Router();
const { getWorkspaces, createWorkspace, deleteWorkspace, getDashboard } = require('../controllers/workspaceController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.delete('/:id', deleteWorkspace);
router.get('/:workspaceId/dashboard', getDashboard);

module.exports = router;