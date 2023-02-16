const fsP = require('fs/promises')
const fs = require('fs')
const path = require('path')
const {format} = require('date-fns')

const logEvents = async(message, fileName) => {
    const dirPath = path.join(__dirname, '../..', 'logs')
    const filePath = path.join(__dirname, '../..', 'logs', fileName)

    try {
        if(!fs.existsSync(dirPath)) {
            fsP.mkdir(dirPath)
        }

        await fsP.appendFile(filePath, message)
    } catch(err) {
        console.error(err)
    }
}

const logger = async(req, res, next) => {
    const date = `[${format(new Date(), 'dd/MM/yyyy:HH:mm:ss')}]`
    const message = `${req.ip} -- ${date} ${req.method}\t${req.path}\t${req.headers.origin}   ${req.header('user-agent')}\n`
    await logEvents(message, 'reqLog.log')
    next()
}

module.exports = {
    logEvents,
    logger
}