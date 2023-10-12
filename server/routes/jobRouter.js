import { Router } from 'express'
import jobModel from '../models/jobModel.js'
import 'express-async-errors'
import { StatusCodes } from 'http-status-codes';
import { validateCreateJob, validateIdParam } from '../middleware/validationMiddleware.js'
import mongoose from 'mongoose';

const router = Router()

router.get('/', async (req, res) => {
    const { search, jobStatus, jobType, sort } = req.query
    const queryObject = {
        //createdBy: req.user.userId,
    }
    if (search) {
        //$options: 'i' = khong phan biet hoa thuong
        queryObject.$or = [
            { position: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
        ]
    }
    if (jobStatus && jobStatus !== 'all') {
        queryObject.jobStatus = jobStatus
    }
    if (jobType && jobType !== 'all') {
        queryObject.jobType = jobType
    }
    //sort('-createdAt') giam dan, sort('createdAt') tang dan
    const sortOptions = {
        newest: '-createdAt',
        oldest: 'createdAt',
        'a-z': 'position',
        'z-a': '-position'
    }
    const sortKey = sortOptions[sort] || sortOptions.newest

    const pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;
    

    const jobs = await jobModel.find(queryObject)
        .sort(sortKey)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

    const totals = await jobModel.countDocuments(queryObject)
    const numOfPages = Math.ceil(totals / pageSize);
    res.status(StatusCodes.OK).json({ totals, pageNumber, pageSize, numOfPages, jobs })
})

router.get('/thongke', async (req, res) => {
    // [
    //     {
    //         "_id": "pending",
    //         "count": 2
    //     }
    // ]
    let stats = await jobModel.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        { $group: { _id: '$jobStatus', count: { $sum: 1 } } },
    ]);

    // {
    //     "pending": 2
    // }
    stats = stats.reduce((acc, curr) => {
        const { _id: tittle, count } = curr
        acc[tittle] = count
        return acc
    }, {})

    res.status(StatusCodes.OK).json(stats)
})

router.get('/:id', validateIdParam, async (req, res) => {
    const job = await jobModel.findById(req.params.id)
    res.status(StatusCodes.OK).json(job)
})

router.post('/', validateCreateJob, async (req, res) => {
    req.body.createdBy = req.user.userId
    const job = await jobModel.create(req.body)
    res.status(StatusCodes.CREATED).json(job)
})

router.delete('/:id', validateIdParam, async (req, res) => {
    const job = await jobModel.findByIdAndDelete(req.params.id)
    res.status(StatusCodes.OK).json({ message: 'Job is delete', job })
})

router.put('/:id', validateIdParam, async (req, res) => {
    const job = await jobModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(StatusCodes.OK).json({ message: 'Job is update', job })
})

export default router