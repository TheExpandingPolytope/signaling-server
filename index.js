const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 8080 });
 
wss.on('connection', function connection(ws) {
    ws.id = uuidv1();

    ws.on('message', function incoming(message) {
        console.log(message+" from: "+ws.id);
        wss.clients.forEach((Ws)=>{
            if(ws.id != Ws.id)
                Ws.send(message);
        })
    });

    console.log('connection:'+ws.id)
});