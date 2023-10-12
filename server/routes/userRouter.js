import { Router } from 'express'
import userModel from '../models/userModel.js'
import Job from '../models/jobModel.js'
import 'express-async-errors'
import { StatusCodes } from 'http-status-codes';
import { authorizePermissions } from '../middleware/authMiddleware.js'
import uploadMulter from '../middleware/multerMiddleware.js'


const router = Router()

router.get('/current-user', async (req, res) => {
    // req.user.userId da set ben trong middleware authenticateUser
    const user = await userModel.findOne({ _id: req.user.userId });
    const userWithoutPassword = user.toJSON();
    res.status(StatusCodes.OK).json({ user: userWithoutPassword });
});

router.get('/admin/app-stats', [authorizePermissions('user'), async (req, res) => {
    const users = await User.countDocuments();
    const jobs = await Job.countDocuments();
    res.status(StatusCodes.OK).json({ users, jobs });
}])

router.post('/upload', uploadMulter.single('avatar'), (req, res) => {
    console.log(req.file)// `uploads/${req.file.filename}`
    res.status(StatusCodes.OK).json({ message: 'upload success' });
})

export default router