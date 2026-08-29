import { useProjects } from '../../context/ProjectContext';
import { useState } from 'react';
import TaskDetailModal from '../task/TaskDetailModal';

/**
 * KanbanBoard - Displays tasks in a Kanban-style board
 * @param {Object} project - The current project
 * @returns {JSX.Element}
 */
function KanbanBoard({ project }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const { updateTask } = useProjects();

  if (!project) return null;

  // Group tasks by status
  const todoTasks = [];
  const inProgressTasks = [];
  const doneTasks = [];

  project.categories.forEach(category => {
    category.tasks.forEach(task => {
      const taskWithCategory = { 
        ...task, 
        categoryName: category.name, 
        categoryColor: category.color,
        categoryId: category.id
      };
      if (task.completed) {
        doneTasks.push(taskWithCategory);
      } else if (task.startDay <= getCurrentDay()) {
        inProgressTasks.push(taskWithCategory);
      } else {
        todoTasks.push(taskWithCategory);
      }
    });
  });

  function getCurrentDay() {
    // Simple simulation - in real app would calculate from start date
    return 15;
  }

  function handleTaskClick(task) {
    setSelectedTask(task);
  }

  function handleCloseModal() {
    setSelectedTask(null);
  }

  function handleSaveTask(updatedTask) {
    if (updatedTask && selectedTask?.categoryId) {
      updateTask(project.id, selectedTask.categoryId, updatedTask);
      setSelectedTask(updatedTask);
    }
  }

  const columns = [
    { id: 'todo', title: 'To Do', tasks: todoTasks, color: '#8064A2' },
    { id: 'inprogress', title: 'In Progress', tasks: inProgressTasks, color: '#F79646' },
    { id: 'done', title: 'Done', tasks: doneTasks, color: '#2E7D45' }
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        padding: '20px'
      }}>
        {columns.map(column => (
          <div key={column.id} style={{
            background: 'var(--white)',
            border: '1px solid var(--gray-light)',
            borderRadius: '12px',
            padding: '16px',
            minHeight: '400px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid',
              borderColor: column.color
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: column.color
              }}></div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                {column.title}
              </h3>
              <span style={{
                marginLeft: 'auto',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--gray)',
                background: 'var(--gray-light)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {column.tasks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {column.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task, task.categoryId || project.categories.find(c => c.tasks.includes(task))?.id)}
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: task.categoryColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px'
                  }}>
                    {task.categoryName}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: '8px'
                  }}>
                    {task.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--gray)'
                    }}>
                      Day {task.startDay} • {task.duration}d
                    </div>
                    {task.buffer > 0 && (
                      <div style={{
                        fontSize: '10px',
                        color: 'var(--c-buffer)',
                        background: 'rgba(184, 190, 199, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        +{task.buffer}d buffer
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default KanbanBoard;
