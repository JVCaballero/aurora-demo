import { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';

const TaskDependencyManager = ({ task, projectId, categoryId, onClose }) => {
  const { projects, updateTask } = useProjects();
  const [selectedPredecessor, setSelectedPredecessor] = useState('');
  const [dependencyType, setDependencyType] = useState('FS'); // FS, SS, FF, SF
  const [lagDays, setLagDays] = useState(0);

  if (!task) return null;

  // Get all tasks from the project (excluding current task)
  const allTasks = [];
  projects.forEach(p => {
    if (p.id === projectId) {
      p.categories.forEach(c => {
        c.tasks.forEach(t => {
          if (t.id !== task.id) {
            allTasks.push({ ...t, categoryName: c.name });
          }
        });
      });
    }
  });

  const handleAddDependency = () => {
    if (!selectedPredecessor) return;

    const predecessorTask = allTasks.find(t => t.id === selectedPredecessor);
    if (!predecessorTask) return;

    // Update predecessor's successors
    const updatedPredecessor = {
      ...predecessorTask,
      successorIds: [...(predecessorTask.successorIds || []), task.id]
    };

    // Update current task's predecessors
    const updatedTask = {
      ...task,
      predecessorIds: [...(task.predecessorIds || []), selectedPredecessor],
      dependencyType,
      lagDays
    };

    // Find the category of the predecessor task
    const predecessorCategory = projects
      .find(p => p.id === projectId)
      ?.categories.find(c => c.tasks.some(t => t.id === selectedPredecessor));

    if (predecessorCategory) {
      updateTask(projectId, predecessorCategory.id, selectedPredecessor, {
        successorIds: updatedPredecessor.successorIds
      });
    }

    updateTask(projectId, categoryId, task.id, {
      predecessorIds: updatedTask.predecessorIds,
      dependencyType,
      lagDays
    });

    setSelectedPredecessor('');
    setDependencyType('FS');
    setLagDays(0);
  };

  const handleRemoveDependency = (predecessorId) => {
    const predecessorTask = allTasks.find(t => t.id === predecessorId);

    // Remove from predecessor's successors
    const updatedPredecessorSuccessors = (predecessorTask?.successorIds || [])
      .filter(id => id !== task.id);

    // Remove from current task's predecessors
    const updatedTaskPredecessors = (task.predecessorIds || [])
      .filter(id => id !== predecessorId);

    if (predecessorTask) {
      const predecessorCategory = projects
        .find(p => p.id === projectId)
        ?.categories.find(c => c.tasks.some(t => t.id === predecessorId));

      if (predecessorCategory) {
        updateTask(projectId, predecessorCategory.id, predecessorId, {
          successorIds: updatedPredecessorSuccessors
        });
      }
    }

    updateTask(projectId, categoryId, task.id, {
      predecessorIds: updatedTaskPredecessors
    });
  };

  const predecessorTasks = (task.predecessorIds || [])
    .map(id => allTasks.find(t => t.id === id))
    .filter(Boolean);

  return (
    <div className="task-dependency-manager">
      <h3>Task Dependencies</h3>

      {/* Current Dependencies List */}
      <div className="dependencies-list">
        <h4>Predecessors</h4>
        {predecessorTasks.length === 0 ? (
          <p className="no-deps">No dependencies set</p>
        ) : (
          <ul>
            {predecessorTasks.map(predecessor => (
              <li key={predecessor.id} className="dependency-item">
                <span className="task-name">{predecessor.name}</span>
                <span className="category-tag">{predecessor.categoryName}</span>
                {task.dependencyType && (
                  <span className="dep-type">{task.dependencyType}</span>
                )}
                {task.lagDays > 0 && (
                  <span className="lag-days">+{task.lagDays} days</span>
                )}
                <button
                  onClick={() => handleRemoveDependency(predecessor.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Dependency */}
      <div className="add-dependency-form">
        <h4>Add Dependency</h4>
        <select
          value={selectedPredecessor}
          onChange={(e) => setSelectedPredecessor(e.target.value)}
          className="task-select"
        >
          <option value="">Select predecessor task...</option>
          {allTasks.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.categoryName})
            </option>
          ))}
        </select>

        <div className="dependency-options">
          <label>
            Type:
            <select
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value)}
            >
              <option value="FS">Finish to Start (FS)</option>
              <option value="SS">Start to Start (SS)</option>
              <option value="FF">Finish to Finish (FF)</option>
              <option value="SF">Start to Finish (SF)</option>
            </select>
          </label>

          <label>
            Lag Days:
            <input
              type="number"
              value={lagDays}
              onChange={(e) => setLagDays(parseInt(e.target.value) || 0)}
              min="0"
            />
          </label>
        </div>

        <button
          onClick={handleAddDependency}
          disabled={!selectedPredecessor}
          className="add-btn"
        >
          Add Dependency
        </button>
      </div>

      {/* Help Text */}
      <div className="dependency-help">
        <h4>Dependency Types:</h4>
        <ul>
          <li><strong>FS (Finish to Start):</strong> Predecessor must finish before this task can start</li>
          <li><strong>SS (Start to Start):</strong> Predecessor must start before this task can start</li>
          <li><strong>FF (Finish to Finish):</strong> Predecessor must finish before this task can finish</li>
          <li><strong>SF (Start to Finish):</strong> Predecessor must start before this task can finish</li>
        </ul>
      </div>

      <style jsx>{`
        .task-dependency-manager {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem;
        }
        .dependencies-list ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }
        .dependency-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--gray-50);
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .task-name {
          font-weight: 500;
          flex: 1;
        }
        .category-tag {
          font-size: 11px;
          padding: 2px 6px;
          background: var(--primary);
          color: white;
          border-radius: 3px;
        }
        .dep-type {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          background: var(--gray-200);
          border-radius: 3px;
        }
        .lag-days {
          font-size: 11px;
          color: var(--gray-600);
        }
        .remove-btn {
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
        }
        .add-dependency-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          background: var(--gray-50);
          border-radius: 8px;
        }
        .task-select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--gray-200);
          border-radius: 6px;
          font-family: inherit;
        }
        .dependency-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .dependency-options label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .dependency-options select,
        .dependency-options input {
          padding: 6px;
          border: 1px solid var(--gray-200);
          border-radius: 4px;
        }
        .add-btn {
          padding: 10px 16px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .dependency-help {
          font-size: 12px;
          color: var(--gray-600);
          background: var(--gray-50);
          padding: 12px;
          border-radius: 8px;
        }
        .dependency-help h4 {
          margin: 0 0 8px;
          font-size: 13px;
        }
        .dependency-help ul {
          margin: 0;
          padding-left: 16px;
        }
        .dependency-help li {
          margin-bottom: 4px;
        }
        .no-deps {
          color: var(--gray-500);
          font-style: italic;
          font-size: 13px;
        }
        [data-theme="dark"] .dependency-item {
          background: var(--gray-800);
        }
        [data-theme="dark"] .add-dependency-form {
          background: var(--gray-800);
        }
        [data-theme="dark"] .dependency-help {
          background: var(--gray-800);
        }
      `}</style>
    </div>
  );
};

export default TaskDependencyManager;
