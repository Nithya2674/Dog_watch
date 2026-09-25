import express from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  getMyReports,
  updateReport,
  deleteReport,
  getNearbyReports,
  getDashboardStats,
} from '../controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/nearby', getNearbyReports);
router.get('/', getAllReports);
router.get('/my', authMiddleware, getMyReports);
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/:id', getReportById);
router.post('/', authMiddleware, createReport);
router.put('/:id', authMiddleware, updateReport);
router.delete('/:id', authMiddleware, deleteReport);

export default router;
