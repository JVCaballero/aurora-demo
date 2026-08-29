import React, { useState } from 'react';
import { useTaskComments } from '../../hooks/useTaskActivity';
import Button from '../common/Button';
import Input from '../common/Input';
import { sanitizeInput } from '../../utils/security';

/**
 * TaskComments component - Manages comments for a task
 * @param {Array} initialComments - Initial comments array
 * @param {Function} onSave - Callback to save comments to parent
 * @returns {JSX.Element}
 */
const TaskComments = ({ initialComments = [], onSave }) => {
  const { comments, addComment, deleteComment, setComments } = useTaskComments(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const comment = addComment(sanitizeInput(newComment));
    
    if (comment && onSave) {
      onSave([...comments, comment]);
    }
    
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleDelete = (commentId) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    deleteComment(commentId);
    
    if (onSave) {
      onSave(updatedComments);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm var(--muted-ink) text-center py-4">
            No comments yet. Be the first to add one!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-var(--white) border border-var(--border) rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-var(--primary) rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm var(--ink)">{comment.author}</p>
                    <p className="text-xs var(--muted-ink)">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs var(--danger) hover:underline"
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm var(--ink) whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-var(--border)">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button 
            type="submit" 
            variant="primary"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
