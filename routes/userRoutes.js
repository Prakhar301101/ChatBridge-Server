const express = require("express");
const router = express.Router();
const userController=require('../controllers/userController');
const verifyAuth =require('../middlewares/authMiddleware');


router.post('/api/users',userController.registerUser);
router.post('/api/users/login',userController.loginUser);
router.get('/api/users/me',verifyAuth,userController.getUser);
router.get('/api/messages/:id',verifyAuth,userController.getMessages)

module.exports=router;