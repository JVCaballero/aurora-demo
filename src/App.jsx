import { ProjectProvider, useProjects } from './context/ProjectContext';
import Sidebar from './components/Sidebar';
import ProjectHeader from './components/ProjectHeader';
import GanttChart from './components/GanttChart';

function MainContent() {
  const { selectedProject } = useProjects();

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
        
        {/* Gantt Chart Section */}
        <div style={{ padding: '0 32px 48px' }}>
          <GanttChart project={selectedProject} />
          
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
