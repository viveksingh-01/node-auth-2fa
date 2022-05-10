import { Router } from 'express';
import {
  getLoggedinUser,
  login,
  logout,
  process2FAuth,
  refreshAccessToken,
  signup,
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/validateOTP', process2FAuth);
router.get('/user', getLoggedinUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

export default router;
