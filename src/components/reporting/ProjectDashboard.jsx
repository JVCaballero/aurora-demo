import { useState, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { BarChart3, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProjectDashboard = ({ projectId }) => {
  const { projects } = useProjects();
  const [activeTab, setActiveTab] = useState('overview');

  const project = projects.find(p => p.id === projectId);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!project) return null;

    let totalTasks = 0;
    let completedTasks = 0;
    let totalBuffer = 0;
    let tasksWithDependencies = 0;
    let maxEndDay = 0;

    project.categories.forEach(cat => {
      cat.tasks.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
        totalBuffer += task.buffer || 0;
        if (task.predecessorIds?.length > 0) tasksWithDependencies++;
        const endDay = task.startDay + task.duration + (task.buffer || 0);
        if (endDay > maxEndDay) maxEndDay = endDay;
      });
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate,
      totalBuffer,
      tasksWithDependencies,
      totalCategories: project.categories.length,
      timelineDays: maxEndDay
    };
  }, [project]);

  // Category breakdown for reports
  const categoryBreakdown = useMemo(() => {
    if (!project) return [];

    return project.categories.map(cat => {
      const total = cat.tasks.length;
      const completed = cat.tasks.filter(t => t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: cat.name,
        color: cat.color,
        totalTasks: total,
        completedTasks: completed,
        completionPercentage: percentage
      };
    });
  }, [project]);

  // Upcoming tasks
  const upcomingTasks = useMemo(() => {
    if (!project) return [];

    const now = Date.now();
    return project.categories
      .flatMap(cat => cat.tasks.map(task => ({ ...task, categoryName: cat.name })))
      .filter(task => !task.completed)
      .sort((a, b) => a.startDay - b.startDay)
      .slice(0, 5);
  }, [project]);

  if (!project || !metrics) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'progress', label: 'Progress', icon: CheckCircle },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            {/* Metric Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#2952A3' }}>
                  <Calendar size={24} color="white" />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{metrics.totalTasks}</span>
                  <span className="metric-label">Total Tasks</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#9BBB59' }}>
                  <CheckCircle size={24} color="white" />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{metrics.completedTasks}</span>
                  <span className="metric-label">Completed</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#F79646' }}>
                  <Clock size={24} color="white" />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{metrics.pendingTasks}</span>
                  <span className="metric-label">Pending</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#4BACC6' }}>
                  <BarChart3 size={24} color="white" />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{metrics.completionRate}%</span>
                  <span className="metric-label">Completion Rate</span>
                </div>
              </div>
            </div>

            {/* Progress by Category */}
            <div className="category-progress">
              <h3>Progress by Category</h3>
              {categoryBreakdown.map(cat => (
                <div key={cat.name} className="category-bar">
                  <div className="category-header">
                    <span className="category-name" style={{ color: cat.color }}>{cat.name}</span>
                    <span className="category-stats">{cat.completedTasks}/{cat.totalTasks} ({cat.completionPercentage}%)</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${cat.completionPercentage}%`, background: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Tasks */}
            <div className="upcoming-tasks">
              <h3>Upcoming Tasks</h3>
              {upcomingTasks.length === 0 ? (
                <p className="no-tasks">No upcoming tasks</p>
              ) : (
                <ul>
                  {upcomingTasks.map(task => (
                    <li key={task.id} className="task-item">
                      <AlertCircle size={16} color="var(--gray-500)" />
                      <span className="task-name">{task.name}</span>
                      <span className="task-category">{task.categoryName}</span>
                      <span className="task-day">Day {task.startDay}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="dashboard-progress">
            <h3>Detailed Progress Report</h3>
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map(cat => (
                  <tr key={cat.name}>
                    <td style={{ color: cat.color, fontWeight: 600 }}>{cat.name}</td>
                    <td>{cat.totalTasks}</td>
                    <td>{cat.completedTasks}</td>
                    <td>{cat.totalTasks - cat.completedTasks}</td>
                    <td>
                      <div className="mini-progress">
                        <div
                          className="mini-progress-fill"
                          style={{ width: `${cat.completionPercentage}%`, background: cat.color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>{metrics.totalTasks}</strong></td>
                  <td><strong>{metrics.completedTasks}</strong></td>
                  <td><strong>{metrics.pendingTasks}</strong></td>
                  <td>
                    <div className="mini-progress">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${metrics.completionRate}%`, background: 'var(--primary)' }}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'timeline':
        return (
          <div className="dashboard-timeline">
            <h3>Timeline Analysis</h3>
            <div className="timeline-stats">
              <div className="timeline-stat">
                <span className="stat-value">{metrics.timelineDays}</span>
                <span className="stat-label">Total Days</span>
              </div>
              <div className="timeline-stat">
                <span className="stat-value">{metrics.totalBuffer}</span>
                <span className="stat-label">Buffer Days</span>
              </div>
              <div className="timeline-stat">
                <span className="stat-value">{metrics.tasksWithDependencies}</span>
                <span className="stat-label">Tasks with Dependencies</span>
              </div>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="dashboard-export">
            <h3>Export Reports</h3>
            <p>Download your project data in various formats:</p>
            <div className="export-options">
              <button className="export-btn" onClick={() => alert('CSV export would be triggered here')}>
                <Download size={20} />
                Export to CSV
              </button>
              <button className="export-btn" onClick={() => alert('PDF export would be triggered here')}>
                <Download size={20} />
                Export to PDF
              </button>
              <button className="export-btn" onClick={() => alert('JSON export would be triggered here')}>
                <Download size={20} />
                Export to JSON
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="project-dashboard">
      <div className="dashboard-header">
        <h2>{project.name} - Dashboard</h2>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .project-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--white);
          border-radius: 12px;
          border: 1px solid var(--gray-light);
        }
        .dashboard-header h2 {
          margin: 0;
          font-family: 'Anton', sans-serif;
          color: var(--ink);
        }
        .dashboard-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--gray-200);
          padding-bottom: 8px;
        }
        .dashboard-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .dashboard-tab:hover {
          background: var(--gray-100);
        }
        .dashboard-tab.active {
          background: var(--primary);
          color: white;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--gray-50);
          border-radius: 12px;
        }
        .metric-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .metric-info {
          display: flex;
          flex-direction: column;
        }
        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          font-family: 'Anton', sans-serif;
        }
        .metric-label {
          font-size: 13px;
          color: var(--gray-600);
        }
        .category-progress {
          margin-bottom: 24px;
        }
        .category-progress h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--ink);
        }
        .category-bar {
          margin-bottom: 12px;
        }
        .category-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .category-name {
          font-weight: 600;
          font-size: 14px;
        }
        .category-stats {
          font-size: 13px;
          color: var(--gray-600);
        }
        .progress-track {
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .upcoming-tasks h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--ink);
        }
        .upcoming-tasks ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--gray-50);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .task-name {
          flex: 1;
          font-weight: 500;
        }
        .task-category {
          font-size: 12px;
          padding: 4px 8px;
          background: var(--gray-200);
          border-radius: 4px;
          color: var(--gray-700);
        }
        .task-day {
          font-size: 12px;
          color: var(--gray-500);
        }
        .progress-table {
          width: 100%;
          border-collapse: collapse;
        }
        .progress-table th,
        .progress-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--gray-200);
        }
        .progress-table th {
          font-weight: 600;
          color: var(--gray-600);
          font-size: 13px;
        }
        .total-row td {
          background: var(--gray-50);
          font-weight: 600;
        }
        .mini-progress {
          height: 6px;
          background: var(--gray-200);
          border-radius: 3px;
          overflow: hidden;
          width: 100px;
        }
        .mini-progress-fill {
          height: 100%;
          border-radius: 3px;
        }
        .timeline-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .timeline-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: var(--gray-50);
          border-radius: 12px;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--primary);
          font-family: 'Anton', sans-serif;
        }
        .stat-label {
          font-size: 13px;
          color: var(--gray-600);
          margin-top: 8px;
        }
        .export-options {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .export-btn:hover {
          opacity: 0.9;
        }
        .no-tasks {
          color: var(--gray-500);
          font-style: italic;
        }
        [data-theme="dark"] .metric-card,
        [data-theme="dark"] .task-item,
        [data-theme="dark"] .timeline-stat {
          background: var(--gray-800);
        }
        [data-theme="dark"] .progress-table th {
          border-color: var(--gray-700);
        }
        [data-theme="dark"] .total-row td {
          background: var(--gray-800);
        }
      `}</style>
    </div>
  );
};

export default ProjectDashboard;
