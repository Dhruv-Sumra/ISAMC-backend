import express from 'express';
import { getGalleries, addGallery, deleteGallery } from '../controller/galleryController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getGalleries);
router.post('/', userAuth, adminAuth, addGallery);
router.delete('/:id', userAuth, adminAuth, deleteGallery);

export default router; 