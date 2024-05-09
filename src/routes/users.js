import express from 'express';

import Usercontroller from '../controller/users.js';

const router = express.Router();

router.post('/register', Usercontroller.register);

router.post('/login', Usercontroller.login);

router.patch('/delete/:idUser', Usercontroller.Deleteusers);



export default router;
