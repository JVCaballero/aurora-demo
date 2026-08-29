import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { X, ChevronDown, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from './Modal';

function GanttChart({ project }) {
  const [hiddenCategories, setHiddenCategories] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const { updateTask, deleteTask } = useProjects();

  if (!project) return null;

  // Calculate total timeline
  let maxDay = 0;
  project.categories.forEach(cat => {
    cat.tasks.forEach(task => {
      const endDay = task.startDay + task.duration + (task.buffer || 0);
      if (endDay > maxDay) maxDay = endDay;
    });
  });

  const TOTAL_DAYS = Math.max(maxDay, 30);

  function pct(day) {
    return (day / TOTAL_DAYS * 100);
  }

  function toggleCategory(catKey) {
    setHiddenCategories(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  }

  function handleTaskClick(task, categoryId) {
    setEditingTask({ task, categoryId });
  }

  function closeEditModal() {
    setEditingTask(null);
  }

  function handleTaskUpdate(updates) {
    if (editingTask) {
      updateTask(project.id, editingTask.categoryId, editingTask.task.id, updates);
      closeEditModal();
    }
  }

  function handleDeleteTask() {
    if (editingTask) {
      deleteTask(project.id, editingTask.categoryId, editingTask.task.id);
      closeEditModal();
    }
  }

  // Generate month headers
  const months = [];
  const daysPerMonth = 20; // Approximate working days
  const numMonths = Math.ceil(TOTAL_DAYS / daysPerMonth);
  for (let i = 0; i < numMonths; i++) {
    months.push(`Month ${i + 1}`);
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ 
        background: 'var(--white)', 
        border: '1px solid var(--gray-light)', 
        borderRadius: '12px', 
        overflow: 'hidden',
        minWidth: '820px'
      }}>
        {/* Month Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-light)' }}>
          <div style={{ flex: '0 0 240px', padding: '10px' }}></div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${numMonths}, 1fr)` }}>
            {months.map((m, i) => (
              <div key={i} style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: 'var(--gray)', 
                textAlign: 'center', 
                padding: '6px 0',
                borderLeft: i > 0 ? '1px solid var(--gray-light)' : 'none'
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Categories and Tasks */}
        {project.categories.map((category) => {
          const isHidden = hiddenCategories[category.id];
          
          return (
            <div key={category.id}>
              {/* Category Header */}
              <div 
                onClick={() => toggleCategory(category.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '9px 16px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  background: isHidden ? '#f6f8fb' : '#fff',
                }}
                onMouseEnter={(e) => {
                  if (!isHidden) e.currentTarget.style.background = '#f6f8fb';
                }}
                onMouseLeave={(e) => {
                  if (!isHidden) e.currentTarget.style.background = '#fff';
                }}
              >
                {isHidden ? (
                  <ChevronRight size={12} color="var(--gray)" />
                ) : (
                  <ChevronDown size={12} color="var(--gray)" />
                )}
                <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: category.color }}></div>
                <span>{category.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--gray)', fontWeight: 500 }}>
                  {category.tasks.length} tasks
                </span>
              </div>

              {/* Tasks */}
              {!isHidden && category.tasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', minHeight: '30px' }}>
                  <div 
                    onClick={() => handleTaskClick(task, category.id)}
                    style={{ 
                      flex: '0 0 240px', 
                      padding: '4px 16px 4px 40px', 
                      fontSize: '13px', 
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f6f8fb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {task.completed && (
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '50%', 
                        background: 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '10px'
                      }}>✓</div>
                    )}
                    {task.name}
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: '20px', margin: '4px 0' }}>
                    {/* Main Task Bar */}
                    <div style={{ 
                      position: 'absolute', 
                      height: '16px', 
                      top: '2px', 
                      left: `${pct(task.startDay)}%`, 
                      width: `${pct(task.duration)}%`,
                      borderRadius: '4px', 
                      background: category.color,
                      opacity: 0.92,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTaskClick(task, category.id)}
                    title={`${task.name}: ${task.duration} days`}
                    ></div>
                    
                    {/* Buffer Bar */}
                    {task.buffer > 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        height: '16px', 
                        top: '2px', 
                        left: `${pct(task.startDay + task.duration)}%`, 
                        width: `${pct(task.buffer)}%`,
                        borderRadius: '4px', 
                        background: 'var(--c-buffer)',
                        opacity: 0.6,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleTaskClick(task, category.id)}
                      title={`Buffer: ${task.buffer} days`}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={closeEditModal}
        title="Edit Task"
        footer={
          <>
            <button
              onClick={handleDeleteTask}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={closeEditModal}
              style={{
                padding: '10px 20px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Done
            </button>
          </>
        }
      >
        {editingTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
                Task Name
              </label>
              <input
                type="text"
                defaultValue={editingTask.task.name}
                onChange={(e) => handleTaskUpdate({ name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
                  Start Day
                </label>
                <input
                  type="number"
                  defaultValue={editingTask.task.startDay}
                  onChange={(e) => handleTaskUpdate({ startDay: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
                  Duration (days)
                </label>
                <input
                  type="number"
                  defaultValue={editingTask.task.duration}
                  onChange={(e) => handleTaskUpdate({ duration: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
                Buffer (days)
              </label>
              <input
                type="number"
                defaultValue={editingTask.task.buffer || 0}
                onChange={(e) => handleTaskUpdate({ buffer: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={editingTask.task.completed}
                  onChange={(e) => handleTaskUpdate({ completed: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Mark as completed</span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GanttChart;
