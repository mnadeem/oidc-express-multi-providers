import promClient from 'prom-client'
import { logger } from './logger'

// Create a Registry which registers the metrics
const register = new promClient.Registry()
promClient.collectDefaultMetrics({ register });

const measureRequestDurationMiddleware = (req, res, next) => {
    const start = Date.now()
    res.once('finish', () => {
        const duration = Date.now() - start
        logger.debug(
            'Time taken to process %s %s is: %s with status %s',
            req.method,
            req.originalUrl,
            duration,
            res.statusCode
        )
    })
    next()
}

const Histogram = promClient.Histogram

const requestDuration = new Histogram({
    name: `http_request_duration_seconds`,
    help: `request duration histogram`,
    labelNames: ['handler' , 'method', 'statuscode'],
    //buckets: [0.5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
})

// Register the histogram
register.registerMetric(requestDuration)

export const profilerMiddleware = (req, res, next) => {
        //const start = Date.now();
        const end = requestDuration.startTimer()
        res.once('finish', () => {
            //const duration = Date.now() - start;
            //requestDuration.labels(req.url, req.method, res.statusCode).observe(duration);
            //requestDuration.observe({ handler:req.url, method: req.method, statuscode: res.statusCode }, duration);
            const duration = end({ handler:req.url, method: req.method, statuscode: res.statusCode })
            logger.debug('Time taken to process %s %s is: %s s with status %s', req.method, req.originalUrl, duration, res.statusCode)
        })

        next()
}

export const metricsEndpoint = async (request, response) => {
    response.set('Content-Type', register.contentType)
    response.send(await register.metrics())
}

