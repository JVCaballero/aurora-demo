import { Router } from 'express';
import {
  getProjectReport,
  getTaskCompletionReport,
  getResourceUtilizationReport,
  getTimelineReport,
  exportReportToCSV,
  exportReportToPDF,
  getDashboardMetrics
} from '../controllers/reportController.js';

const router = Router();

// GET /api/reports/project/:id - Get comprehensive project report
router.get('/project/:id', getProjectReport);

// GET /api/reports/task-completion/:projectId - Get task completion statistics
router.get('/task-completion/:projectId', getTaskCompletionReport);

// GET /api/reports/resource-utilization/:projectId - Get resource utilization
router.get('/resource-utilization/:projectId', getResourceUtilizationReport);

// GET /api/reports/timeline/:projectId - Get timeline analysis
router.get('/timeline/:projectId', getTimelineReport);

// GET /api/reports/dashboard/:projectId - Get dashboard metrics
router.get('/dashboard/:projectId', getDashboardMetrics);

// GET /api/reports/export/:projectId/csv - Export report to CSV
router.get('/export/:projectId/csv', exportReportToCSV);

// GET /api/reports/export/:projectId/pdf - Export report to PDF
router.get('/export/:projectId/pdf', exportReportToPDF);

export default router;
