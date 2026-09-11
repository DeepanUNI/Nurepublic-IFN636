const jwt = require('jsonwebtoken');

// verifies the jwt and attached decoded user to req.user
function requireAuth (req, res, next ){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Authentication token missing'});

    }
    const token =authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // id,role//
        next();

    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token'});

    }
}

//restrics a rout toa specific role (eg: 'admin')//
function requireRole(role) {
    return (req,res, next) => {
        if (!req.user || req.user.role !==role) {
            return res.status(403).json ({ message: 'Insufficient permissions'});
        
        }
        next();
    };
}
module.exports= {requireAuth, requireRole};