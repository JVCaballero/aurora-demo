import { pool } from '../server.js';
import multer from 'multer';

// Configure multer for memory storage (for base64 encoding)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images, PDFs, ZIPs, text files, Word documents'), false);
    }
  }
});

// Get attachments for a task
export async function getTaskAttachments(req, res) {
  try {
    const { taskId } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, u.name as uploader_name
       FROM attachments a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.task_id = $1
       ORDER BY a.created_at DESC`,
      [taskId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

// Create an attachment
export async function createAttachment(req, res) {
  try {
    const { taskId, userId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Convert file to base64 for storage
    const base64Data = file.buffer.toString('base64');
    const url = `data:${file.mimetype};base64,${base64Data}`;
    
    const result = await pool.query(
      `INSERT INTO attachments (task_id, user_id, filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [taskId, userId || null, file.originalname, url, file.size, file.mimetype]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, metadata)
       SELECT p.id, $2, 'attachment_uploaded', 'attachment', $1, jsonb_build_object('filename', $3)
       FROM tasks t
       JOIN categories cat ON t.category_id = cat.id
       JOIN projects p ON cat.project_id = p.id
       WHERE t.id = $1`,
      [taskId, userId, file.originalname]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating attachment:', error);
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
}

// Delete an attachment
export async function deleteAttachment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check ownership if userId provided
    if (userId) {
      const ownerCheck = await pool.query(
        'SELECT user_id FROM attachments WHERE id = $1',
        [id]
      );
      
      if (ownerCheck.rows.length > 0 && ownerCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own attachments' });
      }
    }
    
    const result = await pool.query(
      'DELETE FROM attachments WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id)
       SELECT p.id, $2, 'attachment_deleted', 'attachment', $1
       FROM attachments a
       JOIN tasks t ON a.task_id = t.id
       JOIN categories cat ON t.category_id = cat.id
       JOIN projects p ON cat.project_id = p.id
       WHERE a.id = $1`,
      [id, userId]
    );
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
}

// Download an attachment (returns file data)
export async function downloadAttachment(req, res) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM attachments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachment = result.rows[0];
    
    // Send file as download
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.send(Buffer.from(attachment.file_path.split(',')[1], 'base64'));
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
}
