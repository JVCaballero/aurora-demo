import { createContext, useContext, useState, useEffect } from 'react';
import { initialProjects } from '../data/sampleData';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('aurora-projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || null);

  useEffect(() => {
    localStorage.setItem('aurora-projects', JSON.stringify(projects));
  }, [projects]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  function addProject(project) {
    setProjects(prev => [...prev, { ...project, id: Date.now().toString(), categories: [] }]);
  }

  function updateProject(projectId, updates) {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));
  }

  function deleteProject(projectId) {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(projects[0]?.id || null);
    }
  }

  function addCategory(projectId, category) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, categories: [...p.categories, { ...category, id: Date.now().toString(), tasks: [] }] }
        : p
    ));
  }

  function updateCategory(projectId, categoryId, updates) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            categories: p.categories.map(c => 
              c.id === categoryId ? { ...c, ...updates } : c
            )
          }
        : p
    ));
  }

  function deleteCategory(projectId, categoryId) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, categories: p.categories.filter(c => c.id !== categoryId) }
        : p
    ));
  }

  function addTask(projectId, categoryId, task) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            categories: p.categories.map(c => 
              c.id === categoryId 
                ? { ...c, tasks: [...c.tasks, { ...task, id: Date.now().toString() }] }
                : c
            )
          }
        : p
    ));
  }

  function updateTask(projectId, categoryId, taskId, updates) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            categories: p.categories.map(c => 
              c.id === categoryId 
                ? { 
                    ...c, 
                    tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                  }
                : c
            )
          }
        : p
    ));
  }

  function deleteTask(projectId, categoryId, taskId) {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            categories: p.categories.map(c => 
              c.id === categoryId 
                ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) }
                : c
            )
          }
        : p
    ));
  }

  const value = {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    addProject,
    updateProject,
    deleteProject,
    addCategory,
    updateCategory,
    deleteCategory,
    addTask,
    updateTask,
    deleteTask,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
