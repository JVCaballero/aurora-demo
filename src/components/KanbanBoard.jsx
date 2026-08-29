import { useProjects } from '../context/ProjectContext';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

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
      const taskWithCategory = { ...task, categoryName: category.name, categoryColor: category.color };
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

  function handleTaskClick(task, categoryId) {
    setSelectedTask({ task, categoryId });
  }

  function handleCloseModal() {
    setSelectedTask(null);
  }

  function handleStatusChange(completed) {
    if (selectedTask) {
      updateTask(project.id, selectedTask.categoryId, selectedTask.task.id, { completed });
      handleCloseModal();
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
      <Modal
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        title="Task Details"
        footer={
          <>
            {!selectedTask?.task.completed && (
              <button
                onClick={() => handleStatusChange(true)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Mark Complete
              </button>
            )}
            {selectedTask?.task.completed && (
              <button
                onClick={() => handleStatusChange(false)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Reopen
              </button>
            )}
            <button
              onClick={handleCloseModal}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--gray)',
                border: '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </>
        }
      >
        {selectedTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: selectedTask.task.categoryColor,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}>
                {selectedTask.task.categoryName}
              </div>
              <h3 style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: '20px',
                fontWeight: 400,
                color: 'var(--ink)',
                marginBottom: '12px'
              }}>
                {selectedTask.task.name}
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '16px',
              background: 'var(--paper)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Start Day
                </div>
                <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '24px', color: 'var(--primary)' }}>
                  {selectedTask.task.startDay}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Duration
                </div>
                <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '24px', color: 'var(--primary)' }}>
                  {selectedTask.task.duration} days
                </div>
              </div>
              {selectedTask.task.buffer > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Buffer
                  </div>
                  <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '24px', color: 'var(--c-buffer)' }}>
                    +{selectedTask.task.buffer} days
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Status
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: selectedTask.task.completed ? 'var(--success)' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: selectedTask.task.completed ? 'var(--success)' : 'var(--accent)'
                  }}></div>
                  {selectedTask.task.completed ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default KanbanBoard;
