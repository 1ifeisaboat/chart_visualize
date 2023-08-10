const readFile = require('../utils/readFile')
const path = require('path')
module.exports = {
    async duration(ctx, next) {
        const start = Date.now()
        await next()
        const end = Date.now()
        ctx.response.set('X-Time-Response', end - start + 'ms')
    },
    async setResHeader(ctx, next) {
        ctx.response.set('Content-Type', 'application/json; charset=utf-8')
        await next()
    },
    async getFileData(ctx, next) {
        const fileStr = '../data/' + ctx.request.url.replace('/api', '') + '.json'
        const filePath = path.resolve(__dirname, fileStr)
        const ret = await readFile(filePath)
        ctx.response.body = ret
    },
}