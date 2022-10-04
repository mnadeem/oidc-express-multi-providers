import express from 'express'
import { auth, requiresAuth } from 'express-openid-connect'
import { stringToArray } from './algo'
import { logger } from './logger'
import { API_END_POINT } from './api'

export const oidc = express()

const APP_BASE_URL = process.env.APP_BASE_URL

const OIDC_PF_ISSUER_BASE_URL = process.env.OIDC_PF_ISSUER_BASE_URL
const OIDC_PF_CLIENT_ID = process.env.OIDC_PF_CLIENT_ID
const OIDC_PF_CLIENT_SECRET = process.env.OIDC_PF_CLIENT_SECRET

const OIDC_OHID_ISSUER_BASE_URL = process.env.OIDC_OHID_ISSUER_BASE_URL
const OIDC_OHID_CLIENT_ID = process.env.OIDC_OHID_CLIENT_ID
const OIDC_OHID_CLIENT_SECRET = process.env.OIDC_OHID_CLIENT_SECRET

const OIDC_ENCRYPTION_KEY_SECRET = process.env.OIDC_ENCRYPTION_KEY_SECRET
const OIDC_SESSION_MAX_IDLE_TIME_IN_SEC = process.env.OIDC_SESSION_MAX_IDLE_TIME_IN_SEC || 1800

const APP_AUTHORIZED_ROLES = stringToArray(process.env.APP_AUTHORIZED_ROLES)

logger.info('Authorized Roles : %O', APP_AUTHORIZED_ROLES)

let middlewares = {}

middlewares.pf = auth({
    authRequired: false,
    baseURL: APP_BASE_URL,
    issuerBaseURL: OIDC_PF_ISSUER_BASE_URL,
    clientID: OIDC_PF_CLIENT_ID,
    clientSecret: OIDC_PF_CLIENT_SECRET,
    secret: OIDC_ENCRYPTION_KEY_SECRET,
    idpLogout: true,
    idTokenSigningAlg: 'ES256',
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile address email phone',
    },
    session: {
        rollingDuration: OIDC_SESSION_MAX_IDLE_TIME_IN_SEC,
        cookie: { path: '/' }
    },
})

middlewares.ohid = auth({
    authRequired: false,
    baseURL: APP_BASE_URL,
    issuerBaseURL: OIDC_OHID_ISSUER_BASE_URL,
    clientID: OIDC_OHID_CLIENT_ID,
    clientSecret: OIDC_OHID_CLIENT_SECRET,
    secret: OIDC_ENCRYPTION_KEY_SECRET,
    idpLogout: true,
    idTokenSigningAlg: 'ES256',
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email phone address',
    },
    session: {
        rollingDuration: OIDC_SESSION_MAX_IDLE_TIME_IN_SEC,
        cookie: { path: '/' }
    },
})

oidc.use(function (req, res, next) {
    const iss = req.iss;

    // Store routing param in session
    // req.session.iss = iss;

    // Apply middleware
    middlewares.ohid(req, res, next)
})

oidc.use(function (err, req, res, next) {
    logger.debug('OIDC Error %s', err.stack)
    logger.error('OIDC Error occurred: %o', err)
    res.redirect('/')
})

const getUserInfo = (req, next) => {

    return req.oidc.user;
}

export const getRoles = (userRoles, next) => {
    let roles = []
    try {

        let matchingRoles = APP_AUTHORIZED_ROLES.filter((role) =>
            userRoles.includes(role)
        )
        //logger.debug('Matched Roles %j : %j', userRoles, matchingRoles)
        if (matchingRoles && matchingRoles.length > 0) {
            roles = matchingRoles.map((role) => role.split('_').pop().toUpperCase())
        }
    } catch (ex) {
        logger.error('Error occurred While Getting roles : %O', ex)
        if (next) {
            next(ex)
        }
    }
    return roles
}

const rbacCheckCallback = async (req, res, next) => {
    try {

        //const userInfo = getUserInfo(req, next)



    } catch (ex) {
        logger.error('error ', ex)
        next(ex)
    }
    next()
}

export const addRbacCheckMiddleware = () => {
    oidc.use('/api/*', requiresAuth(), rbacCheckCallback)
}

export const ensureLoggedInMiddleware = (req, res, next) => {

    if (!req.oidc?.user) {
        return res.redirect(`/login`); // /issuer-a/login or /issuer-b/login
    }
    next()
}

oidc.get(API_END_POINT.USER,  (req, res, next) => {

    try {
        const user = req.oidc.user

        res.send(user)
    } catch (ex) {
        next(ex)
    }
})