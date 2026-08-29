import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { FolderPlus, Trash2, Edit2, CheckCircle, Clock, Archive, X } from 'lucide-react';
import Modal from './Modal';

function Sidebar() {
  const { projects, selectedProjectId, setSelectedProjectId, addProject, deleteProject } = useProjects();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProjectColor, setNewProjectColor] = useState('#2952A3');

  function handleAddProject() {
    if (newProjectName.trim()) {
      addProject({
        name: newProjectName.trim(),
        description: newProjectDescription,
        startDate: newProjectStartDate,
        status: 'active',
        color: newProjectColor
      });
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectStartDate(new Date().toISOString().split('T')[0]);
      setNewProjectColor('#2952A3');
      setShowAddModal(false);
    }
  }

  function handleDeleteProject(e, projectId) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  }

  return (
    <div style={{
      width: '280px',
      background: '#fff',
      borderRight: '1px solid var(--gray-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--gray-light)'
      }}>
        <h1 style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '24px',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: 'var(--primary)',
          marginBottom: '4px'
        }}>
          Aurora
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--gray)' }}>Project Management</p>
      </div>

      {/* Projects List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Projects
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <FolderPlus size={16} />
            New
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedProjectId === project.id ? 'var(--primary-light)' : 'transparent',
                border: selectedProjectId === project.id ? `2px solid var(--primary)` : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedProjectId !== project.id) {
                  e.currentTarget.style.background = '#f6f8fb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProjectId !== project.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: project.color || 'var(--primary)',
                flexShrink: 0
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {project.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px'
                }}>
                  {project.status === 'active' && (
                    <>
                      <CheckCircle size={12} color="var(--success)" />
                      <span style={{ fontSize: '11px', color: 'var(--gray)' }}>Active</span>
                    </>
                  )}
                  {project.status === 'completed' && (
                    <>
                      <CheckCircle size={12} color="var(--success)" />
                      <span style={{ fontSize: '11px', color: 'var(--gray)' }}>Completed</span>
                    </>
                  )}
                  {project.status === 'onHold' && (
                    <>
                      <Clock size={12} color="var(--accent)" />
                      <span style={{ fontSize: '11px', color: 'var(--gray)' }}>On Hold</span>
                    </>
                  )}
                  {project.status === 'archived' && (
                    <>
                      <Archive size={12} color="var(--gray)" />
                      <span style={{ fontSize: '11px', color: 'var(--gray)' }}>Archived</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteProject(e, project.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray)',
                  padding: '4px',
                  opacity: 0.6
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--gray-light)',
        fontSize: '12px',
        color: 'var(--gray)'
      }}>
        <p>Aurora v1.0</p>
        <p style={{ marginTop: '4px' }}>© 2024</p>
      </div>

      {/* Add Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewProjectName('');
          setNewProjectDescription('');
          setNewProjectStartDate(new Date().toISOString().split('T')[0]);
          setNewProjectColor('#2952A3');
        }}
        title="Create New Project"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewProjectName('');
                setNewProjectDescription('');
                setNewProjectStartDate(new Date().toISOString().split('T')[0]);
                setNewProjectColor('#2952A3');
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: 'var(--gray)',
                border: '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddProject}
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
              Create Project
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              autoFocus
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
              Description
            </label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--gray)', marginBottom: '6px' }}>
              Start Date
            </label>
            <input
              type="date"
              value={newProjectStartDate}
              onChange={(e) => setNewProjectStartDate(e.target.value)}
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
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={newProjectColor}
                onChange={(e) => setNewProjectColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--gray)' }}>
                {newProjectColor}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Sidebar;
