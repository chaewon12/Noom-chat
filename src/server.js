import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { instrument } from '@socket.io/admin-ui';
const app=express();

app.set('view engine',"pug");
app.set("views", __dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(req,res)=>res.render("home"));
app.get("/*",(req,res)=>res.redirect("/"));

const handleListen=()=>console.log("Listening 0n http://localhost:3000");

const httpServer= http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});
instrument(wsServer, {
    auth: false
});

function publicRooms(){
     /*const sides=wsServer.sockets.adapter.sids;
    const rooms=wsServer.sockets.adapter.rooms;와 동일한 코드*/
    const {
        sockets: {
          adapter: { sids, rooms },
        },
    } = wsServer;
   
    const publicRooms=[];
    rooms.forEach((_,key)=>{
        if(sids.get(key)===undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    wsServer.sockets.emit("room_change", publicRooms());
    socket.on("enter_room", (roomName,nickname, done) => {
        socket.join(roomName);
        socket["nickname"]=nickname;
        done();
        wsServer.to(roomName).emit("welcom",socket.nickname,countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
});

httpServer.listen(3000,handleListen);