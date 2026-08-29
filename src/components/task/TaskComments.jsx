import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { sanitizeInput } from '../../utils/security';

const TaskComments = ({ taskId, comments, onAddComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const sanitizedComment = sanitizeInput(newComment);
    
    await onAddComment(taskId, {
      id: crypto.randomUUID(),
      text: sanitizedComment,
      author: 'Current User',
      timestamp: new Date().toISOString()
    });
    
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(taskId, commentId);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="task-comments">
      <div className="task-comments__list">
        {comments.length === 0 ? (
          <p className="task-comments__empty">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="task-comment">
              <div className="task-comment__header">
                <span className="task-comment__author">{comment.author}</span>
                <span className="task-comment__time">{formatTime(comment.timestamp)}</span>
              </div>
              <p className="task-comment__text">{comment.text}</p>
              <button
                className="task-comment__delete"
                onClick={() => handleDelete(comment.id)}
                aria-label="Delete comment"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="task-comments__form">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>

      <style jsx>{`
        .task-comments {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .task-comments__list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }
        .task-comments__empty {
          color: var(--gray-500);
          text-align: center;
          padding: 2rem;
          font-style: italic;
        }
        .task-comment {
          padding: 1rem;
          background: var(--gray-50);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }
        .task-comment__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .task-comment__author {
          font-weight: 600;
          color: var(--ink);
          font-size: 0.875rem;
        }
        .task-comment__time {
          color: var(--gray-500);
          font-size: 0.75rem;
        }
        .task-comment__text {
          color: var(--gray-700);
          margin: 0.5rem 0;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .task-comment__delete {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .task-comment__delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        .task-comments__form {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .task-comments__form > div {
          flex: 1;
        }
        [data-theme="dark"] .task-comment {
          background: var(--gray-800);
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .task-comment__text {
          color: var(--gray-300);
        }
      `}</style>
    </div>
  );
};

export default TaskComments;
