import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js'
import { authenticateUser } from './middleware/authMiddleware.js'
import cookieParser from 'cookie-parser'

import userRouter from './routes/userRouter.js'
import jobRouter from './routes/jobRouter.js'
import authRouter from './routes/authRouter.js'

import { dirname } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'


const app = express()
const apiBaseUrl = process.env.API_URL

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.resolve(__dirname, './wwwroot')))
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// api
app.use(`${apiBaseUrl}/jobs`, authenticateUser, jobRouter)
app.use(`${apiBaseUrl}/users`, authenticateUser, userRouter);
app.use(`${apiBaseUrl}/auth`, authRouter)

// deploy react and nodejs
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './wwwroot', 'index.html'));
});

// app.use('*', (req, res)=>{
//     res.status(404).json({message: 'Not found'})
// })

app.use(errorHandlerMiddleware)// dat cuoi cung

try {
    const port = process.env.PORT || 5000
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Database ready')
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
} catch (error) {
    console.error(error)
    process.exit(1)
}
