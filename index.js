const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 8080 });
 
wss.on('connection', function connection(ws) {
    ws.id = uuidv1();
    ws.room = 'default';

    ws.on('message', function incoming(data) {
        var message = JSON.parse(data);

        switch (message.type) {
            case 'room':
                console.log(message.data);
                ws.room = message.data;
                break;
            case 'signal':
                console.log(message.data);
                wss.clients.forEach((Ws)=>{
                    if(ws.id != Ws.id && ws.room == Ws.room)
                        Ws.send(message.data);
                })
                break;
            default:
                break;
        }
        
    });

    console.log('connection:'+ws.id)
});