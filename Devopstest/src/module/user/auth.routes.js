import express from 'express';
import multer from 'multer';
import { signup, signin, signout } from './Auth.controller.js';

const router = express.Router();
const upload = multer();

router.post('/sign-up', upload.none(), signup);

router.post('/sign-in', upload.none(), signin);

router.post('/sign-out', upload.none(), signout);

export default router;
