import * as fs from 'fs'
import path from 'path'
//import * as fs from 'fs'
//import {fs} from 'fs'
//https://stackoverflow.com/questions/43622337/using-import-fs-from-fs

import pinoms from 'pino-multi-stream';

const BASE_PATH = process.env.LOG_BASE_PATH || '/app/log'
const APP_NAME = process.env.APP_NAME || 'lob-app-ui'
const POD_NAME = process.env.POD_NAME || 'lob-app-ui'
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug'

const BASE_LOG_DIR = `${BASE_PATH}/${APP_NAME}`

console.log('Base Log dir: ', BASE_LOG_DIR)
console.log('Log level: ', LOG_LEVEL)

export const createLogDirectory = () => {
    try {
        if (!fs.existsSync(path.resolve(BASE_LOG_DIR))) {
            fs.mkdirSync(path.resolve(BASE_LOG_DIR))
            console.log('Directory : ', BASE_LOG_DIR, ' Has been created!')
        } else {
            console.log('Directory : ', BASE_LOG_DIR, ' Already Exists!')
        }
    } catch (err) {
        console.error('Error Creating Directory : ', BASE_LOG_DIR, ' Error: ', err)
    }
}

//createLogDirectory()

export const logger = pinoms({
    formatters: {
        level(level) {
            return { level };
        },
    },
    streams: [
        //{ level: LOG_LEVEL, stream: fs.createWriteStream(`${BASE_LOG_DIR}/${POD_NAME}.log`) },
        { level: LOG_LEVEL, stream: process.stdout }
    ]
})

