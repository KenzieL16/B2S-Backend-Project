import express from 'express';

import Usercontroller from '../controller/users.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.post('/register', Usercontroller.register);

router.post('/login', Usercontroller.login);

router.patch('/delete/:idUser', Usercontroller.Deleteusers);

router.put('/update', verifyToken, Usercontroller.Updateusers);

router.get('/get-all-users', verifyToken, Usercontroller.Getusers);


export default router;
