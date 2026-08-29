import { Router } from 'express';
import {
  getTasksByCategory,
  createTask,
  updateTask,
  deleteTask,
  addTaskDependency,
  removeTaskDependency,
  updateTaskDependencies,
  getTaskWithDependencies
} from '../controllers/taskController.js';

const router = Router();

// GET /api/tasks/category/:categoryId - Get all tasks in a category
router.get('/category/:categoryId', getTasksByCategory);

// GET /api/tasks/:id/dependencies - Get task with its dependencies
router.get('/:id/dependencies', getTaskWithDependencies);

// POST /api/tasks - Create new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

// POST /api/tasks/:id/dependencies - Add dependency to task
router.post('/:id/dependencies', addTaskDependency);

// DELETE /api/tasks/:id/dependencies/:dependencyId - Remove dependency
router.delete('/:id/dependencies/:dependencyId', removeTaskDependency);

// PUT /api/tasks/:id/dependencies - Update task predecessor/successor arrays
router.put('/:id/dependencies', updateTaskDependencies);

export default router;
