import { Router } from 'express'
import userModel from '../models/userModel.js'
import 'express-async-errors'
import { StatusCodes } from 'http-status-codes';
import { validateRegisterInput, validateLoginInput } from '../middleware/validationMiddleware.js'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customError.js'
import { createJWT, verifyJWT } from '../utils/tokenUtils.js'


const router = Router()

router.post('/login', validateLoginInput, async (req, res) => {
    const user = await userModel.findOne({ email: req.body.email })
    if (!user) throw new UnauthenticatedError('Email is not exist')

    const isPasswordCorrect = await comparePassword(req.body.password, user.password)
    if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid password')

    const token = createJWT({
        userId: user._id,
        email: user.email,
        role: user.role
    })

    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(StatusCodes.OK).json({ user, token });
})

router.post('/register', validateRegisterInput, async (req, res) => {
    req.body.password = await hashPassword(req.body.password)
    await userModel.create(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Created user success' })
})

router.get('/logout', (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
});

// test token
router.get('/token', async (req, res) => {
    const bearerToken = req.header('authorization');
    const token = bearerToken.split(' ')[1]
    const isValid = verifyJWT(token)
    res.status(StatusCodes.OK).json(isValid)
})

export default router