import express from 'express';
import { submitPaper } from '../controller/paperController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/submit', upload.single('paper'), submitPaper);

export default router; 