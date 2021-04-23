const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./Utils/messages.js");
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require("./Utils/users");
const botname = "admin";

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// set static folder
app.use(express.static(path.join(__dirname,"public")));

//run when the client connect 
io.on("connection", socket => {
    socket.on("joinRoom" , ({username , room}) => {
        const user = userJoin(socket.id ,username , room);
        socket.join(user.room);


        //welcome current user
        socket.emit("message", formatMessage(botname,"Welcome to ChatCord!!"));

        //Broadcaste when the user connect
        socket.broadcast.to(user.room).emit("message",formatMessage(botname, `${user.username} has join the chat`));


        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });


   
   
    //listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
    
        io.to(user.room).emit('message', formatMessage(user.username, msg));
      });
    

    //run when client dissconnect
    socket.on("disconnect" , () =>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit("message",formatMessage(botname,`${user.username} has left the chat`));
             //send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        } 
    });
} );


const PORT =  process.env.PORT || 3000 ;

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
