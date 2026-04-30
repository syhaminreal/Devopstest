import express from 'express';
import multer from 'multer';
import { signup, signin } from '../controllers/Auth.controller.js';

const router = express.Router();
const upload = multer();

router.post('/sign-up', upload.none(), signup);

router.post('/sign-in', upload.none(), signin);

router.post('/sign-out', (req, res) => {
  res.send('Post/ api/auth/sign-out response');
});

export default router;
