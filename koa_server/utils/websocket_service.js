const readFile = require('./readFile')
const path = require('path')
const WebSocket = require('ws')
const wss = new WebSocket.Server({
    port: 9001
})
module.exports = {
    listen() {
        wss.on('connection', ws => {
            console.log('客户端连接成功...');
            ws.on('message', async msg => {
                const payload = JSON.parse(msg)
                console.log('接收到客户端发送的消息...\n', payload);
                if (payload.action === 'getData') {
                    const fileStr = '../data/' + payload.chartName + '.json'
                    const filePath = path.resolve(__dirname, fileStr)
                    try {
                        payload.data = await readFile(filePath)
                        ws.send(JSON.stringify(payload))
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    wss.clients.forEach(client => {
                        // A client WebSocket broadcasting to every other connected WebSocket clients, excluding itself.
                        // // if (client !== ws && client.readyState === WebSocket.OPEN)

                        // A client WebSocket broadcasting to all connected WebSocket clients, including itself.
                        if (client.readyState === WebSocket.OPEN)
                            client.send(JSON.stringify(payload))
                    });
                }
            })
        })
    }
}