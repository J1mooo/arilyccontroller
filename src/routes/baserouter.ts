import { Router } from 'express'

export const baseRouter = Router()

baseRouter.get('/', (req, res) => {
    res.render('index')
})