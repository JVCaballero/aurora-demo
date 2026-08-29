import { pool } from '../server.js';

// Get comprehensive project report
export async function getProjectReport(req, res) {
  try {
    const { id } = req.params;
    
    // Get project details
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectResult.rows[0];
    
    // Get task statistics
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) as total_tasks,
         COUNT(*) FILTER (WHERE completed = true) as completed_tasks,
         COUNT(*) FILTER (WHERE completed = false) as pending_tasks,
         AVG(duration) as avg_duration,
         SUM(buffer) as total_buffer
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1`,
      [id]
    );
    
    // Get category breakdown
    const categoryResult = await pool.query(
      `SELECT c.name, c.color, 
              COUNT(t.id) as task_count,
              COUNT(t.id) FILTER (WHERE t.completed = true) as completed_count
       FROM categories c
       LEFT JOIN tasks t ON c.id = t.category_id
       WHERE c.project_id = $1
       GROUP BY c.id, c.name, c.color
       ORDER BY c.position`,
      [id]
    );
    
    // Get timeline info
    const timelineResult = await pool.query(
      `SELECT 
         MIN(start_day) as earliest_start,
         MAX(start_day + duration + buffer) as latest_end
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1`,
      [id]
    );
    
    res.json({
      project,
      statistics: statsResult.rows[0],
      categories: categoryResult.rows,
      timeline: timelineResult.rows[0]
    });
  } catch (error) {
    console.error('Error generating project report:', error);
    res.status(500).json({ error: 'Failed to generate project report' });
  }
}

// Get task completion report
export async function getTaskCompletionReport(req, res) {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      `SELECT 
         c.name as category_name,
         c.color as category_color,
         COUNT(t.id) as total_tasks,
         COUNT(t.id) FILTER (WHERE t.completed = true) as completed_tasks,
         ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / NULLIF(COUNT(t.id), 0), 2) as completion_percentage,
         COUNT(t.id) FILTER (WHERE t.completed = false AND t.start_day < 0) as overdue_tasks
       FROM categories c
       LEFT JOIN tasks t ON c.id = t.category_id
       WHERE c.project_id = $1
       GROUP BY c.id, c.name, c.color
       ORDER BY c.position`,
      [projectId]
    );
    
    // Overall completion
    const overallResult = await pool.query(
      `SELECT 
         COUNT(t.id) as total_tasks,
         COUNT(t.id) FILTER (WHERE t.completed = true) as completed_tasks,
         ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / NULLIF(COUNT(t.id), 0), 2) as overall_completion
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1`,
      [projectId]
    );
    
    res.json({
      byCategory: result.rows,
      overall: overallResult.rows[0]
    });
  } catch (error) {
    console.error('Error generating task completion report:', error);
    res.status(500).json({ error: 'Failed to generate task completion report' });
  }
}

// Get resource utilization report
export async function getResourceUtilizationReport(req, res) {
  try {
    const { projectId } = req.params;
    
    // Get team members and their activity
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role,
              COUNT(DISTINCT t.id) as assigned_tasks,
              COUNT(DISTINCT t.id) FILTER (WHERE t.completed = true) as completed_tasks
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN tasks t ON t.id IN (
         SELECT entity_id FROM activity_logs 
         WHERE user_id = u.id AND entity_type = 'task'
       )
       WHERE pm.project_id = $1
       GROUP BY u.id, u.name, u.email, pm.role`,
      [projectId]
    );
    
    // Activity summary
    const activityResult = await pool.query(
      `SELECT action, COUNT(*) as count
       FROM activity_logs al
       JOIN project_members pm ON al.user_id = pm.user_id
       WHERE pm.project_id = $1
       GROUP BY action
       ORDER BY count DESC`,
      [projectId]
    );
    
    res.json({
      teamMembers: membersResult.rows,
      activitySummary: activityResult.rows
    });
  } catch (error) {
    console.error('Error generating resource utilization report:', error);
    res.status(500).json({ error: 'Failed to generate resource utilization report' });
  }
}

// Get timeline analysis report
export async function getTimelineReport(req, res) {
  try {
    const { projectId } = req.params;
    
    // Get tasks with dependency information
    const tasksResult = await pool.query(
      `SELECT t.id, t.name, t.start_day, t.duration, t.buffer, t.completed,
              c.name as category_name,
              t.predecessor_ids,
              t.successor_ids,
              CASE 
                WHEN array_length(t.predecessor_ids, 1) > 0 THEN true
                ELSE false
              END as has_dependencies
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1
       ORDER BY t.start_day`,
      [projectId]
    );
    
    // Critical path analysis (simplified)
    const criticalPathResult = await pool.query(
      `SELECT t.name, t.start_day, t.duration, t.buffer,
              c.name as category_name
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1 AND t.buffer = 0
       ORDER BY t.start_day`,
      [projectId]
    );
    
    res.json({
      tasks: tasksResult.rows,
      criticalPath: criticalPathResult.rows,
      summary: {
        totalTasks: tasksResult.rows.length,
        tasksWithDependencies: tasksResult.rows.filter(t => t.has_dependencies).length,
        criticalTasks: criticalPathResult.rows.length
      }
    });
  } catch (error) {
    console.error('Error generating timeline report:', error);
    res.status(500).json({ error: 'Failed to generate timeline report' });
  }
}

// Get dashboard metrics
export async function getDashboardMetrics(req, res) {
  try {
    const { projectId } = req.params;
    
    // Quick stats
    const statsResult = await pool.query(
      `SELECT 
         COUNT(DISTINCT t.id) as total_tasks,
         COUNT(DISTINCT t.id) FILTER (WHERE t.completed = true) as completed,
         COUNT(DISTINCT t.id) FILTER (WHERE t.completed = false) as pending,
         COUNT(DISTINCT c.id) as total_categories,
         COUNT(DISTINCT td.id) as total_dependencies
       FROM categories c
       LEFT JOIN tasks t ON c.id = t.category_id
       LEFT JOIN task_dependencies td ON t.id = td.predecessor_task_id
       WHERE c.project_id = $1`,
      [projectId]
    );
    
    // Recent activity
    const recentActivityResult = await pool.query(
      `SELECT al.*, u.name as user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [projectId]
    );
    
    // Upcoming tasks (tasks starting soon that aren't completed)
    const upcomingTasksResult = await pool.query(
      `SELECT t.id, t.name, t.start_day, t.duration, c.name as category_name
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1 AND t.completed = false
       ORDER BY t.start_day ASC
       LIMIT 5`,
      [projectId]
    );
    
    res.json({
      stats: statsResult.rows[0],
      recentActivity: recentActivityResult.rows,
      upcomingTasks: upcomingTasksResult.rows
    });
  } catch (error) {
    console.error('Error generating dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to generate dashboard metrics' });
  }
}

// Export report to CSV
export async function exportReportToCSV(req, res) {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      `SELECT t.id, t.name, t.start_day, t.duration, t.buffer, t.completed,
              c.name as category,
              array_to_string(t.predecessor_ids, ',') as predecessors,
              array_to_string(t.successor_ids, ',') as successors
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE c.project_id = $1
       ORDER BY c.position, t.start_day`,
      [projectId]
    );
    
    // Generate CSV
    const headers = ['ID', 'Name', 'Start Day', 'Duration', 'Buffer', 'Completed', 'Category', 'Predecessors', 'Successors'];
    const csvRows = [headers.join(',')];
    
    result.rows.forEach(row => {
      csvRows.push([
        row.id,
        `"${row.name.replace(/"/g, '""')}"`,
        row.start_day,
        row.duration,
        row.buffer,
        row.completed,
        `"${row.category.replace(/"/g, '""')}"`,
        row.predecessors || '',
        row.successors || ''
      ].join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-report.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
}

// Export report to PDF (placeholder - would need pdfkit or similar)
export async function exportReportToPDF(req, res) {
  try {
    const { projectId } = req.params;
    
    // For now, return a message that PDF export requires additional setup
    res.json({
      message: 'PDF export requires pdfkit library',
      install: 'npm install pdfkit',
      projectId
    });
    
    // Implementation example with pdfkit:
    // import PDFDocument from 'pdfkit';
    // const doc = new PDFDocument();
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-report.pdf"`);
    // doc.pipe(res);
    // doc.fontSize(20).text('Project Report', { align: 'center' });
    // ... add more content
    // doc.end();
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
}
