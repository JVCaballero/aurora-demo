import { Router } from 'express';
import {
  getTaskAttachments,
  createAttachment,
  deleteAttachment,
  downloadAttachment
} from '../controllers/attachmentController.js';
import { upload } from '../controllers/attachmentController.js';

const router = Router();

// GET /api/attachments/task/:taskId - Get all attachments for a task
router.get('/task/:taskId', getTaskAttachments);

// POST /api/attachments - Upload new attachment
router.post('/', upload.single('file'), createAttachment);

// DELETE /api/attachments/:id - Delete attachment
router.delete('/:id', deleteAttachment);

// GET /api/attachments/:id/download - Download attachment
router.get('/:id/download', downloadAttachment);

export default router;
