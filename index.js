const app = require('express')();
const http = require('http').Server(app);
require('dotenv').config();
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"]
    }
});
var firebase = require('firebase');
var firebaseConfig = {
    apiKey: "AIzaSyCQgafQhFkTdEw2h8SioLIsY-qZn-asFS4",
    authDomain: "social-acd14.firebaseapp.com",
    databaseURL: "https://social-acd14-default-rtdb.firebaseio.com",
    projectId: "social-acd14",
    storageBucket: "social-acd14.appspot.com",
    messagingSenderId: "634405676455",
    appId: "1:634405676455:web:5352a899c17c46a7a40282",
    measurementId: "G-XRR1WKPNG6"
};
firebase.initializeApp(firebaseConfig);
let database = firebase.database()

var jwt = require('jsonwebtoken');


io.on('connection', async (socket) => {
    let tokenUser = socket.handshake.auth.token;
    let idUser = socket.handshake.query.mail_id;
    try {
        await jwt.verify(tokenUser, '7j5ATbeZclRvEzjYcOEV0KV7XYNYQ0VD8W7O31mqDKt8H4tThs8cZig7BNW6634b');
        database.ref(idUser).set({
            socket_id: socket.id,
            mail_id: idUser,
        }, function (error) {
            if (error) {
                console.log("Failed with error: " + error)
            } else {
                // The write was successful...
                console.log("success")
            }
        })
        console.log('a user connected');
        socket.on('send-message', async function (e) {
            let findSocketId = await findIdSocket(e.to_user_id);
            console.log('findSocketId-----',findSocketId);
            if (findSocketId === null) return;
            console.log(e.to_user_id, findSocketId, userIds);
            io.to(findSocketId).emit('send-message', {
                from_user_id: idUser,
                content: e.content,
            });
        })
    } catch (error) {

    }

    socket.on('disconnect', () => {
        console.log(socket.id + '-----------disconnect', idUser);
        database.ref(idUser).remove();
    });

});

let findIdSocket = async (mail_id) => {
    let id = null;
   await database.ref(mail_id).once('value')
        .then(function(snapshot) {
            console.log( 'snapshot',snapshot.val() )
            if(snapshot.val()===null) return null;
            id= snapshot.val().socket_id;
        }).catch(function (){

       });
   return id ;


    for (let i = 0; i < userIds.length; i++) {
        if (userIds[i]['mail_id'] === mail_id) {
            id = userIds[i]['socket_id']
            break;
        }
    }
    ;
    return id;
}

http.listen(process.env.PORT || 8080, () => {
    console.log(process.env.PORT);
});