import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { sanitizeInput } from '../../utils/security';

const TaskComments = ({ taskId, comments, onAddComment, onDeleteComment, currentUserId = 'current-user' }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const sanitizedComment = sanitizeInput(newComment);
    
    await onAddComment(taskId, {
      id: crypto.randomUUID(),
      text: sanitizedComment,
      author: 'Current User',
      userId: currentUserId,
      timestamp: new Date().toISOString(),
      parentId: null
    });
    
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setReplyText('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const sanitizedReply = sanitizeInput(replyText);
    
    await onAddComment(taskId, {
      id: crypto.randomUUID(),
      text: sanitizedReply,
      author: 'Current User',
      userId: currentUserId,
      timestamp: new Date().toISOString(),
      parentId: replyTo.id
    });
    
    setReplyText('');
    setReplyTo(null);
    setIsSubmitting(false);
  };

  const handleDelete = (commentId, commentUserId) => {
    // Only allow deleting own comments
    if (commentUserId !== currentUserId) {
      alert('You can only delete your own comments');
      return;
    }
    
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

  const renderCommentThread = (comment, depth = 0) => {
    const isOwnComment = comment.userId === currentUserId;
    const replies = comment.replies || [];
    
    return (
      <div key={comment.id} className="task-comment-thread" style={{ marginLeft: depth > 0 ? '2rem' : '0' }}>
        <div className={`task-comment ${depth > 0 ? 'task-comment--reply' : ''}`}>
          <div className="task-comment__header">
            <span className="task-comment__author">{comment.author}</span>
            <span className="task-comment__time">{formatTime(comment.timestamp)}</span>
          </div>
          <p className="task-comment__text">{comment.text}</p>
          <div className="task-comment__actions">
            {!replyTo && (
              <button
                className="task-comment__action"
                onClick={() => handleReply(comment)}
              >
                Reply
              </button>
            )}
            {isOwnComment && (
              <button
                className="task-comment__delete"
                onClick={() => handleDelete(comment.id, comment.userId)}
                aria-label="Delete comment"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        
        {replyTo?.id === comment.id && (
          <form onSubmit={handleReplySubmit} className="task-comment__reply-form">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              disabled={isSubmitting}
            />
            <div className="task-comment__reply-actions">
              <Button type="submit" disabled={isSubmitting || !replyText.trim()} size="small">
                {isSubmitting ? 'Posting...' : 'Reply'}
              </Button>
              <button
                type="button"
                className="task-comment__cancel"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        {replies.length > 0 && (
          <div className="task-comment__replies">
            {replies.map(reply => renderCommentThread(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="task-comments">
      <div className="task-comments__list">
        {comments.length === 0 ? (
          <p className="task-comments__empty">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => renderCommentThread(comment))
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
          max-height: 400px;
          overflow-y: auto;
        }
        .task-comments__empty {
          color: var(--gray-500);
          text-align: center;
          padding: 2rem;
          font-style: italic;
        }
        .task-comment-thread {
          width: 100%;
        }
        .task-comment {
          padding: 1rem;
          background: var(--gray-50);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
          margin-bottom: 0.5rem;
        }
        .task-comment--reply {
          background: var(--gray-100);
          border-left: 3px solid var(--primary);
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
        .task-comment__actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .task-comment__action {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .task-comment__action:hover {
          background: rgba(99, 102, 241, 0.1);
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
        .task-comment__reply-form {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: var(--white);
          border-radius: 8px;
          border: 1px solid var(--gray-200);
        }
        .task-comment__reply-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .task-comment__cancel {
          background: none;
          border: none;
          color: var(--gray-500);
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
        }
        .task-comment__cancel:hover {
          color: var(--gray-700);
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
        [data-theme="dark"] .task-comment--reply {
          background: var(--gray-700);
          border-left-color: var(--primary);
        }
        [data-theme="dark"] .task-comment__text {
          color: var(--gray-300);
        }
        [data-theme="dark"] .task-comment__reply-form {
          background: var(--gray-800);
          border-color: var(--gray-700);
        }
      `}</style>
    </div>
  );
};

export default TaskComments;
