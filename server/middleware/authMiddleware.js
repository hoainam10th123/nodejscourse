import { verifyJWT } from '../utils/tokenUtils.js';
import { UnauthenticatedError, UnauthorizedError } from '../errors/customError.js';

export const authenticateUser = (req, res, next) => {
    //console.log(req.baseUrl) // /api/jobs
    // if (req.baseUrl === '/api/jobs' && req.method === 'GET' && req.url === '/') {
    //     throw new UnauthorizedError('authentication invalid');
    // }

    const { token } = req.cookies;
    if (!token) throw new UnauthenticatedError('authentication invalid');

    try {
        const { userId, role } = verifyJWT(token);
        //const testUser = userId === '650ee3d8f971f7a1c43e5847';
        // req.user: su dung cho cac request khac
        req.user = { userId, role };
        next();
    } catch (error) {
        throw new UnauthenticatedError('authentication invalid');
    }
};

export const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};