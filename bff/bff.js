import * as env from './env'

import express from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'path'
import { logger } from './logger'

import { profilerMiddleware } from  './metrics'
import { oidc, addRbacCheckMiddleware, ensureLoggedInMiddleware } from './oidc'
import { services } from './services'
import { proxies } from './proxy'
import { API_END_POINT } from './api'
import { read } from 'fs'

const APP_PORT = process.env.APP_PORT || 3006

const app = express()

app.use(cors());


// Measure for all routes,  except those starting with /status and /metrics
app.use('/((?!status|metrics))*', profilerMiddleware)

app.use(oidc)

// Ensure loggedIn excluding status|metrics|login|callback|manifest.json
app.use('/((?!status|metrics|login|callback|v1|docs|manifest.json))*', ensureLoggedInMiddleware)

addRbacCheckMiddleware()

app.use(compression())

//app.use(express.static(path.join(__dirname, '..', 'build')))
//app.use(proxies)
// https://github.com/chimurai/http-proxy-middleware/issues/320
// parse application/x-www-form-urlencoded
//app.use(express.urlencoded({ extended: false }))
// parse application/json
//app.use(express.json())

// Add other custom end points

//app.use(services)

/* app.get(API_END_POINT.EVERY_THING_ELSE, function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})
 */
app.listen(APP_PORT, () => {
    logger.info('App is listening for requests on port : %d', APP_PORT);
})