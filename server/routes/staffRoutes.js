import { Router } from 'express';
import { staffLogin } from '../controllers/authController.js';

const router = Router();

router.post('/login', staffLogin);

export default router;
