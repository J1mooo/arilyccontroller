// Middleware to redirect users who are not logged in
export function redirectLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next()
}

// Middleware to redirect logged-in users trying to access public pages
export function redirectHome(req, res, next) {
    if (req.session.user) {
        return res.redirect('/')
    }
    next()
}

// Middleware for role-based authorization
export function authorize(roles?: string) {
    return (req, res, next) => {
        if (
            req.session.user != undefined &&
            (roles == undefined || roles.includes(req.session.user.role))
        ) {
            return next()
        }

        res.status(403).json({ success: false, error: 'Forbidden' })
    }
}

const rateLimitTime: number = 15 * 60 * 1000
const rateLimitMax: number = 50

// Rate Limiting Middleware
export function rateLimiter(
    windowMs: number = rateLimitTime,
    maxRequests: number = rateLimitMax,
) {
    const rateLimit = require('express-rate-limit')
    return rateLimit({
        windowMs: windowMs,
        max: maxRequests,
        message: 'Too many requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    })
}
