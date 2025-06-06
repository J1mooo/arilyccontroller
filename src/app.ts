import express from 'express'
import path from 'path'
import { baseRouter } from './routes/baserouter'


const app = express()

export const {
    PORT = 8080,
    NODE_ENV = 'development',
} = process.env

const IN_PROD = NODE_ENV === 'production'

app.set('trust proxy', process.env.TRUSTED_PROXY || '10.0.10.254')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'static')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function dateLogger() {
    return (
        '#' +
            new Date()
                .toJSON()
                .slice(0, 19)
                .replace(/-/g, '/')
                .replace('T', ' ') +
            ' - '
    )
}

function reqLogger(req, res, next) {
    console.log(dateLogger() + (req.ip.substr(0, 7) == '::ffff:' ? req.ip.substr(7) : req.ip || req.ips) + ' - ' + req.method + ' ' + req.path);
    next()
}

app.use((req, res, next) => reqLogger(req, res, next));

app.use('/', baseRouter)

app.use((req, res, next) => {
    //404
    if (req.accepts('html')) {
        console.log(dateLogger() + 'Not found')
        res.render('includes/404')
        return
    } else if (req.accepts('json')) {
        res.json({ error: 'Not found' })
        return
    }
    const error = new Error('Not found')
    next(error)
})

app.use((error, req, res, next) => {
    //500
    console.error(error)

    res.status(error.status || 500)
    if (req.accepts('html')) {
        console.log(dateLogger() + 'Server side error',
        )
        res.render('includes/500')
    } else if (req.accepts('json')) {
        res.json({
            error: {
                message: error.message,
                status: error.status,
            },
        })
    }
})

app.listen(PORT, () => console.log(`Site is listening on port ${PORT}!`))
