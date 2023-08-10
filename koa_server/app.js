const Koa = require('koa')
const { duration, setResHeader, getFileData } = require('./middleware/index')
const cors = require('koa2-cors')
const WebSocketService = require('./utils/websocket_service')
const app = new Koa()
app.use(cors())
app.use(duration)
app.use(setResHeader)
app.use(getFileData)
app.listen(9000, () => {
    console.log('http://127.0.0.1:9000');
})
WebSocketService.listen()