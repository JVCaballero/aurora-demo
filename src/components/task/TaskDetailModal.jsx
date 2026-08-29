import { useState } from 'react';
import Modal from '../common/Modal';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';

const TaskDetailModal = ({ task, onClose, onUpdateTask }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: 'Comments' },
    { id: 'attachments', label: 'Attachments' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="task-detail__content">
            <h3>{task.name}</h3>
            <p><strong>Status:</strong> {task.status}</p>
            <p><strong>Start:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(task.endDate).toLocaleDateString()}</p>
            {task.description && <p>{task.description}</p>}
          </div>
        );
      case 'comments':
        return (
          <TaskComments
            taskId={task.id}
            comments={task.comments || []}
            onAddComment={(tid, comment) => {
              const updatedTask = {
                ...task,
                comments: [...(task.comments || []), comment]
              };
              onUpdateTask(updatedTask);
            }}
            onDeleteComment={(tid, commentId) => {
              const updatedTask = {
                ...task,
                comments: (task.comments || []).filter(c => c.id !== commentId)
              };
              onUpdateTask(updatedTask);
            }}
          />
        );
      case 'attachments':
        return (
          <TaskAttachments
            taskId={task.id}
            attachments={task.attachments || []}
            onAddAttachment={(tid, attachment) => {
              const updatedTask = {
                ...task,
                attachments: [...(task.attachments || []), attachment]
              };
              onUpdateTask(updatedTask);
            }}
            onDeleteAttachment={(tid, attachmentId) => {
              const updatedTask = {
                ...task,
                attachments: (task.attachments || []).filter(a => a.id !== attachmentId)
              };
              onUpdateTask(updatedTask);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={!!task} onClose={onClose} title="Task Details">
      <div className="task-detail-modal">
        <div className="task-detail-modal__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`task-detail-modal__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="task-detail-modal__content">
          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        .task-detail-modal {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .task-detail-modal__tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--gray-200);
          padding-bottom: 0.5rem;
        }
        .task-detail-modal__tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .task-detail-modal__tab:hover {
          background: var(--gray-100);
          color: var(--ink);
        }
        .task-detail-modal__tab.active {
          background: var(--primary);
          color: white;
        }
        .task-detail-modal__content {
          min-height: 200px;
        }
        .task-detail__content h3 {
          margin: 0 0 1rem;
          color: var(--ink);
          font-family: 'Anton', sans-serif;
        }
        .task-detail__content p {
          margin: 0.5rem 0;
          color: var(--gray-700);
          line-height: 1.6;
        }
        [data-theme="dark"] .task-detail-modal__tabs {
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .task-detail-modal__tab {
          color: var(--gray-400);
        }
        [data-theme="dark"] .task-detail-modal__tab:hover {
          background: var(--gray-800);
          color: var(--gray-200);
        }
        [data-theme="dark"] .task-detail__content p {
          color: var(--gray-300);
        }
      `}</style>
    </Modal>
  );
};

export default TaskDetailModal;
