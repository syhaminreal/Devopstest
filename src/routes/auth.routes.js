import express, { Router } from 'express';
import { signup } from '../controllers/Auth.controller.js';

const router = express.Router();

router.post('/sign-up', signup);

router.post('/sign-in', (req, res) => {
  res.send('Post/ api/auth/sign-in response');
});

router.post('/sign-out', (req, res) => {
  res.send('Post/ api/auth/sign-out response');
});

export default router;
