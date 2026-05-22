import { Router } from 'express';
import { createAppointment, getAppointmentById, updateAppointment } from '../controllers/appointmentController.js';

const router = Router();

router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);

export default router;
