import { useProjects } from '../context/ProjectContext';
import { Calendar, Target, Clock, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function ProjectHeader({ project }) {
  const [editingTask, setEditingTask] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const { addCategory, addTask } = useProjects();

  if (!project) return null;

  // Calculate stats
  let totalTasks = 0;
  let completedTasks = 0;
  let maxDay = 0;

  project.categories.forEach(cat => {
    cat.tasks.forEach(task => {
      totalTasks++;
      if (task.completed) completedTasks++;
      const endDay = task.startDay + task.duration + (task.buffer || 0);
      if (endDay > maxDay) maxDay = endDay;
    });
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const weeksRemaining = Math.ceil(maxDay / 5); // Working days to weeks

  function handleAddCategory() {
    if (newCategoryName.trim()) {
      const colors = ['#8064A2', '#C0504D', '#4BACC6', '#F79646', '#1B4F8A', '#9BBB59'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addCategory(project.id, {
        name: newCategoryName.trim(),
        color: randomColor
      });
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  }

  function handleQuickAddTask(categoryId) {
    const taskName = prompt('Enter task name:');
    if (taskName) {
      const duration = parseInt(prompt('Duration (days):', '5')) || 5;
      const startDay = parseInt(prompt('Start day:', '0')) || 0;
      const buffer = parseInt(prompt('Buffer days (optional):', '0')) || 0;
      
      addTask(project.id, categoryId, {
        name: taskName,
        startDay,
        duration,
        buffer,
        completed: false
      });
    }
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Project Title */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color: 'var(--primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.14em',
          marginBottom: '10px'
        }}>
          PROJECT
        </div>
        <h1 style={{
          fontFamily: 'Archivo, sans-serif',
          fontSize: 'clamp(30px, 5vw, 46px)',
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: '14px',
          color: 'var(--ink)'
        }}>
          {project.name}
        </h1>
        <p style={{ maxWidth: '820px', color: 'var(--gray)', marginBottom: '20px' }}>
          {project.description || 'No description provided'}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--gray-light)',
          borderRadius: '12px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Progress
          </div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--primary)' }}>
            {progressPercent}%
          </div>
          <div style={{ marginTop: '8px', height: '6px', background: 'var(--gray-light)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid var(--gray-light)',
          borderRadius: '12px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Timeline
          </div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--primary)' }}>
            ~{weeksRemaining} wks
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '4px' }}>
            {totalTasks} tasks total
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid var(--gray-light)',
          borderRadius: '12px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Start Date
          </div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: 'var(--primary)' }}>
            {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '4px' }}>
            Day 1 — Kickoff
          </div>
        </div>
      </div>

      {/* Categories Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Categories</h3>
          {!showAddCategory ? (
            <button
              onClick={() => setShowAddCategory(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Add Category
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{
                  padding: '8px 16px',
                  background: 'var(--success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: 'var(--gray)',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Category Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {project.categories.map(category => (
            <div
              key={category.id}
              style={{
                background: '#fff',
                border: '1px solid var(--gray-light)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '200px'
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: category.color
              }}></div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                {category.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray)', marginLeft: 'auto' }}>
                {category.tasks.length} tasks
              </span>
              <button
                onClick={() => handleQuickAddTask(category.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  padding: '4px',
                  marginLeft: '4px'
                }}
                title="Add task"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectHeader;
