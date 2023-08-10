export default class SocketService {
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }
    ws = null
    connected = false
    connectRetryCount = 0
    sendPadding = []
    callbackMapping = {}
    registerCallback(socketType, callback) {
        this.callbackMapping[socketType] = callback
    }
    unRegisterCallback(socketType) {
        this.callbackMapping[socketType] = callback
    }
    connect() {
        if (!window.WebSocket) {
            return console.log('您的浏览器不支持WebSocket');
        }
        this.ws = new WebSocket('ws://localhost:9001')
        this.ws.onopen = () => {
            console.log('服务端连接成功...');
            this.connected = true
            this.connectRetryCount = 0
            this.sendPadding.forEach(data => {
                this.send(data)
            });
            this.sendPadding = []
        }
        this.ws.onclose = () => {
            console.log('服务端连接失败...');
            this.connected = false
            setTimeout(() => {
                this.connectRetryCount++
                this.connect()
            }, this.connectRetryCount * 500);
        }
        this.ws.onmessage = msg => {
            console.log('收到服务端发送的信息...\n', msg);
            const recvData = JSON.parse(msg.data)
            const action = recvData.action
            const socketType = recvData.socketType
            if (this.callbackMapping[socketType]) {
                if (action === 'getData') {
                    this.callbackMapping[socketType].call(this, JSON.parse(recvData.data))
                } else if (action === 'fullScreen') {
                    this.callbackMapping[socketType].call(this, recvData)
                } else if (action === 'themeChange') {
                    this.callbackMapping[socketType].call(this, recvData)
                }
            }
        }
    }
    send(data) {
        if (this.connected) {
                this.ws.send(JSON.stringify(data))
        } else {
            // 将所有发送请求放入一个数组中等待连接成功后发送
            this.sendPadding.push(data)
        }
    }
}