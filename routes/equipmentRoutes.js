import express from 'express';
import { getEquipment, addEquipment, updateEquipment, deleteEquipment } from '../controller/equipmentController.js';
import adminAuth from '../middleware/adminAuth.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.get('/', getEquipment);
router.post('/', userAuth, adminAuth, addEquipment);
router.put('/:id', userAuth, adminAuth, updateEquipment);
router.delete('/:id', userAuth, adminAuth, deleteEquipment);

export default router;