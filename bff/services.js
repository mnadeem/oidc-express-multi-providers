import express from 'express'
import * as os from 'os'
import * as fs from 'fs'
import { logger } from './logger'
import { API_END_POINT } from './api'
import { metricsEndpoint } from  './metrics'

export const services = express()

// expose our metrics at the default URL for Prometheus
services.get(API_END_POINT.METRICS, metricsEndpoint)

services.get(API_END_POINT.STATUS, function (req, res) {
    res.status(200).send({ message: 'API is running' })
})