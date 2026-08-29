import { ProjectProvider, useProjects } from './context/ProjectContext';
import Sidebar from './components/layout/Sidebar';
import ProjectHeader from './components/project/ProjectHeader';
import GanttChart from './components/gantt/GanttChart';
import KanbanBoard from './components/kanban/KanbanBoard';
import { useState } from 'react';
import { Calendar, LayoutGrid, BarChart3 } from 'lucide-react';

function MainContent() {
  const { selectedProject } = useProjects();
  const [currentView, setCurrentView] = useState('gantt');

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Scrollable content area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ProjectHeader project={selectedProject} />
        
        {/* View Tabs */}
        {selectedProject && (
          <div style={{ padding: '0 32px 16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentView('gantt')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: currentView === 'gantt' ? 'var(--primary)' : 'transparent',
                color: currentView === 'gantt' ? '#fff' : 'var(--gray)',
                border: currentView === 'gantt' ? 'none' : '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Calendar size={14} />
              Gantt
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: currentView === 'kanban' ? 'var(--primary)' : 'transparent',
                color: currentView === 'kanban' ? '#fff' : 'var(--gray)',
                border: currentView === 'kanban' ? 'none' : '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: currentView === 'dashboard' ? 'var(--primary)' : 'transparent',
                color: currentView === 'dashboard' ? '#fff' : 'var(--gray)',
                border: currentView === 'dashboard' ? 'none' : '1px solid var(--gray-light)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <BarChart3 size={14} />
              Dashboard
            </button>
          </div>
        )}
        
        {/* View Content */}
        <div style={{ padding: '0 32px 48px' }}>
          {currentView === 'gantt' && selectedProject && (
            <GanttChart project={selectedProject} />
          )}
          {currentView === 'kanban' && selectedProject && (
            <KanbanBoard project={selectedProject} />
          )}
          {currentView === 'dashboard' && selectedProject && (
            <div style={{ 
              background: 'var(--white)', 
              border: '1px solid var(--gray-light)', 
              borderRadius: '12px', 
              padding: '24px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gray)'
            }}>
              <p>Dashboard View - Coming Soon</p>
            </div>
          )}
          
          {/* Footer Info */}
          {selectedProject && (
            <div style={{ 
              maxWidth: '820px', 
              color: 'var(--gray)', 
              fontSize: '13px', 
              marginTop: '24px',
              lineHeight: 1.6
            }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Note:</strong> This is an interactive project timeline. 
                Click on any task to edit its details, duration, or buffer time. 
                Categories can be collapsed by clicking on their headers.
              </p>
              <p>
                <strong>Tip:</strong> Use the sidebar to create new projects or switch between existing ones. 
                All changes are automatically saved to your browser's local storage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <MainContent />
      </div>
    </ProjectProvider>
  );
}

export default App;
