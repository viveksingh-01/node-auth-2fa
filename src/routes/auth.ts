import { Router } from 'express';
import {
  AuthenticatedUser,
  Login,
  RefreshAccessToken,
  Register,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/user', AuthenticatedUser);
router.post('/refresh', RefreshAccessToken);

export default router;
