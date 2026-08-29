import { Router } from 'express';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  getThreadedComments
} from '../controllers/commentController.js';

const router = Router();

// GET /api/comments/task/:taskId - Get all comments for a task
router.get('/task/:taskId', getTaskComments);

// GET /api/comments/task/:taskId/threaded - Get threaded comments for a task
router.get('/task/:taskId/threaded', getThreadedComments);

// POST /api/comments - Create new comment
router.post('/', createComment);

// PUT /api/comments/:id - Update comment
router.put('/:id', updateComment);

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', deleteComment);

export default router;
