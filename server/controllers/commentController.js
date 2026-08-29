import { pool } from '../server.js';

// Get comments for a task
export async function getTaskComments(req, res) {
  try {
    const { taskId } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, u.name as author_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// Create a new comment
export async function createComment(req, res) {
  try {
    const { taskId, content, userId, parentId } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO comments (task_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [taskId, userId || null, content.trim(), parentId || null]
    );
    
    // Fetch full comment with user info
    const fullComment = await pool.query(
      `SELECT c.*, u.name as author_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, metadata)
       SELECT p.id, $2, 'comment_created', 'comment', $1, jsonb_build_object('content', $3)
       FROM tasks t
       JOIN categories cat ON t.category_id = cat.id
       JOIN projects p ON cat.project_id = p.id
       WHERE t.id = $1`,
      [taskId, userId, content.trim()]
    );
    
    res.status(201).json(fullComment.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

// Update a comment
export async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const result = await pool.query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

// Delete a comment
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if user owns the comment
    if (userId) {
      const ownerCheck = await pool.query(
        'SELECT user_id FROM comments WHERE id = $1',
        [id]
      );
      
      if (ownerCheck.rows.length > 0 && ownerCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }
    }
    
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}

// Get threaded comments for a task
export async function getThreadedComments(req, res) {
  try {
    const { taskId } = req.params;
    
    // Get all comments for the task
    const result = await pool.query(
      `SELECT c.*, u.name as author_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    
    // Build threaded structure
    const comments = result.rows;
    const threadedComments = [];
    const commentMap = new Map();
    
    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: build thread structure
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (comment.parent_id === null) {
        threadedComments.push(commentNode);
      } else {
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(commentNode);
        }
      }
    });
    
    res.json(threadedComments);
  } catch (error) {
    console.error('Error fetching threaded comments:', error);
    res.status(500).json({ error: 'Failed to fetch threaded comments' });
  }
}
