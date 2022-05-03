import { Router } from 'express';
import {
  AuthenticatedUser,
  Login,
  Register,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/user', AuthenticatedUser);

export default router;
