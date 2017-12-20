const http = require('http')
const fs = require('fs')
    //创建服务
var server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' })
    res.end(fs.readFileSync('./index.html'))
})


//socket
const Server = require('ws').Server

//建立好了服务端
var wss = new Server({ server })

//存放前端连接的socket
var clientMap = {}
var count = 0
var id = 0
    //当客户端连接，就会触发，回调会接收一个socket对象
wss.on("connection", function(socket) {
    count++
    id++
    socket.id = id
    clientMap[socket.id] = socket
    socket.nickname = '新朋友'
    console.log(`现在有${count}人连接了`)
    broadClients(socket.nickname, 1)

    //当这个客户端发送数据的时候会触发
    socket.on("message", function(msg) {
        //console.log(`客户端${socket.id} 说：${msg}`)
        let info = JSON.parse(msg)
        if (socket.nickname != info.nickname) {
            socket.nickname = info.nickname
            broadClients()
        }
        socket.nickname = info.nickname
        broadcast(socket, info.msg)
    })

    //当客户端断开到时候触发
    socket.on("close", function() {
        //console.log(`客户端${socket.id} 说：${msg}`)
        count--
        let nickname = socket.nickname
        delete clientMap[socket.id]
        broadClients(nickname, 2)
    })

    //当客户端连接出错的时候
    socket.on("error", function(err) {
        console.log(err)
    })

})

//广播函数，像所有的客户端发送某一个客户端说的话
function broadcast(socket, msg) {
    let info = { nickname: socket.nickname, msg: msg, type: 'msg' }
    for (var id in clientMap) {
        info.isMe = socket.id == id ? 'true' : false
        clientMap[id].send(JSON.stringify(info))
    }
}

function broadClients(nickname, type) {
    let clients = []
    for (var id in clientMap) {
        clients.push(clientMap[id].nickname)
    }
    for (var id in clientMap) {
        clientMap[id].send(JSON.stringify({
            count,
            clients,
            type: 'count',
            nickname,
            _type: type
        }))
    }
}



server.listen(2345)
    // server.listen(2345,'127.0.0.1')