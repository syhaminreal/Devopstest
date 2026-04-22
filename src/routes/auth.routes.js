import express from 'express';
import { signup, signin } from '../controllers/Auth.controller.js';

const router = express.Router();

router.post('/sign-up', signup);

router.post('/sign-in', signin);

router.post('/sign-out', (req, res) => {
  res.send('Post/ api/auth/sign-out response');
});

export default router;
