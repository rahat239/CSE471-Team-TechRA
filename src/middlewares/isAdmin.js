// [DEBUG] load isAdmin middleware
module.exports = function isAdmin(req, res, next) {
    try {
        const email = (req.headers.email || '').toLowerCase();
        console.debug('[DEBUG][isAdmin] email from token:', email);
        if (email === 'rahatahmed537@gmail.com') {
            console.debug('[DEBUG][isAdmin] authorized as admin');
            return next();
        }
        console.debug('[DEBUG][isAdmin] forbidden');
        return res.status(403).json({ status: 'fail', message: 'Admin only' });
    } catch (e) {
        console.debug('[DEBUG][isAdmin] error', e);
        return res.status(500).json({ status: 'fail', message: 'Admin check failed' });
    }
};
