import { Router } from 'express';
import {
  AuthenticatedUser,
  Login,
  Logout,
  RefreshAccessToken,
  Register,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/user', AuthenticatedUser);
router.post('/refresh', RefreshAccessToken);
router.post('/logout', Logout);

export default router;
