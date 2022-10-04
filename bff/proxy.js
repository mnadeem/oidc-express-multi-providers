import express from 'express'
import { logger } from './logger'
import { API_END_POINT } from './api'
import { createProxyMiddleware } from 'http-proxy-middleware'

export const proxies = express()

//proxy job only for get
const apiJobService = process.env.SERVICE_JOB || 'lob-api-job:8091'
const apiJobUrl = `http://${apiJobService}`

proxies.use(API_END_POINT.JOB, createProxyMiddleware({ target: apiJobUrl, changeOrigin: false }))
logger.info('Proxied %s to %s', API_END_POINT.JOB, apiJobUrl)

