const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 8080 });

var rooms = {};

function ERROR(val){
    return JSON.stringify({
        type: 'error',
        value: val,
    });
}

function USER_JOIN(id){
    return JSON.stringify({
        type: 'user_join',
        from: id 
    });
}

function USER_LEAVE(){
    return JSON.stringify({
        type: 'user_leave',
        from: id 
    });
}

function USER_SIGNAL(id, value){
    return JSON.stringify({
        type: 'signal',
        from : id,
        value: value,
    });
}

wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(data) {
        
        var message = JSON.parse(data);

        console.log(message);
        
        switch (message.type) {
            case 'init':
                
                if(!message.value){
                    ws.send(ERROR('Identifier not included'));
                    break;
                }

                ws.id = message.value;

                break;

            case 'join':

                if(!message.value){
                    ws.send(ERROR('Room not specified'));
                    break;
                }

                if(!ws.id){
                    ws.send(ERROR('You have not initialized your client identifier'));
                    break;
                }

                var roomId = message.value;
                if(!rooms[roomId]) rooms[roomId] = {};
                rooms[roomId][ws.id] = ws;
                ws.roomId = roomId;

                var room = rooms[roomId];
                for(var userId in room)
                    if(ws.id != userId)
                        room[userId].send(USER_JOIN(ws.id))

                break;

            case 'leave':

                if(!ws.roomId){
                    ws.send(ERROR('You are not in a room'));
                    break;
                }

                if(!rooms[ws.roomId]) {
                    ws.send(ERROR('Room does not exist'));
                    break;
                };

                if(!ws.id){
                    ws.send(ERROR('You have not initialized your client identifier'));
                    break;
                }

                var room = rooms[ws.roomId];
                for(var userId in room)
                    if(ws.id != userId)
                        room[userId].send(USER_LEAVE(ws.id))

                delete rooms[ws.roomId][ws.id]

                ws.roomId = null;
                
                break;

            case 'signal':

                if(!message.recipient){
                    ws.send(ERROR('Recipient not specified'));
                    break;
                }

                if(!ws.roomId){
                    ws.send(ERROR('You are not in a room'));
                    break;
                }

                if(!rooms[ws.roomId]) {
                    ws.send(ERROR('Room does not exist'));
                    break;
                }

                if(!rooms[ws.roomId][message.recipient]){
                    ws.send(ERROR('Recipient does not exist in room'));
                    break;
                }

                rooms[ws.roomId][message.recipient].send(USER_SIGNAL(ws.id, message.value))

                
                break;

            default:

                ws.send(ERROR('Specify init, join, leave or signal as type'));

                break;
        }
        
    });

    console.log('connection:'+ws.id)
});