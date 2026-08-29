import React, { useState } from 'react';
import Modal from '../common/Modal';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';

/**
 * TaskDetailModal - Displays task details with tabs for comments and attachments
 * @param {Object} task - The task object
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSave - Callback to save task changes
 * @returns {JSX.Element}
 */
const TaskDetailModal = ({ task, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [localTask, setLocalTask] = useState(task);

  // Reset local state when task changes
  React.useEffect(() => {
    setLocalTask(task);
    setActiveTab('details');
  }, [task]);

  if (!task) return null;

  const handleSaveActivity = (activityData, type) => {
    const updatedTask = {
      ...localTask,
      [type]: activityData
    };
    setLocalTask(updatedTask);
    
    if (onSave) {
      onSave(updatedTask);
    }
  };

  const toggleTaskStatus = () => {
    const newStatus = localTask.status === 'done' ? 'todo' : 'done';
    const updatedTask = { ...localTask, status: newStatus };
    setLocalTask(updatedTask);
    
    if (onSave) {
      onSave(updatedTask);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: `Comments (${task.comments?.length || 0})` },
    { id: 'attachments', label: `Files (${task.attachments?.length || 0})` }
  ];

  const getStatusVariant = (status) => {
    if (status === 'done') return 'success';
    if (status === 'in-progress') return 'warning';
    return 'secondary';
  };

  const getPriorityVariant = (priority) => {
    if (priority === 'high') return 'danger';
    if (priority === 'medium') return 'warning';
    return 'secondary';
  };

  const renderBadge = (variant, children) => {
    const colors = {
      success: 'var(--success)',
      warning: 'var(--accent)',
      danger: 'var(--danger)',
      secondary: 'var(--gray)'
    };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        background: colors[variant] || colors.secondary,
        color: '#fff'
      }}>
        {children}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.name}
      size="large"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-var(--border)">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-var(--primary) text-var(--primary)'
                  : 'border-transparent text-var(--muted-ink) hover:text-var(--ink)'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm var(--muted-ink) mb-1">Status</p>
                {renderBadge(getStatusVariant(localTask.status), 
                  localTask.status === 'done' ? 'Done' :
                  localTask.status === 'in-progress' ? 'In Progress' : 'To Do'
                )}
              </div>
              
              <div>
                <p className="text-sm var(--muted-ink) mb-1">Priority</p>
                {renderBadge(getPriorityVariant(localTask.priority),
                  localTask.priority?.charAt(0).toUpperCase() + localTask.priority?.slice(1) || 'Normal'
                )}
              </div>

              <div>
                <p className="text-sm var(--muted-ink) mb-1">Start Date</p>
                <p className="font-medium var(--ink)">
                  {new Date(localTask.startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm var(--muted-ink) mb-1">End Date</p>
                <p className="font-medium var(--ink)">
                  {new Date(localTask.endDate).toLocaleDateString()}
                </p>
              </div>

              {localTask.assignee && (
                <div>
                  <p className="text-sm var(--muted-ink) mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-var(--primary) rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {localTask.assignee.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium var(--ink)">{localTask.assignee}</p>
                  </div>
                </div>
              )}

              {localTask.category && (
                <div>
                  <p className="text-sm var(--muted-ink) mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: localTask.color }}
                    />
                    <p className="font-medium var(--ink)">{localTask.category}</p>
                  </div>
                </div>
              )}
            </div>

            {localTask.description && (
              <div>
                <p className="text-sm var(--muted-ink) mb-1">Description</p>
                <p className="var(--ink) whitespace-pre-wrap">{localTask.description}</p>
              </div>
            )}

            <div className="pt-4 flex gap-2">
              <Button 
                onClick={toggleTaskStatus}
                variant={localTask.status === 'done' ? 'secondary' : 'success'}
              >
                {localTask.status === 'done' ? 'Reopen Task' : 'Mark as Complete'}
              </Button>
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <TaskComments 
            initialComments={task.comments || []}
            onSave={(comments) => handleSaveActivity(comments, 'comments')}
          />
        )}

        {activeTab === 'attachments' && (
          <TaskAttachments 
            initialAttachments={task.attachments || []}
            onSave={(attachments) => handleSaveActivity(attachments, 'attachments')}
          />
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
