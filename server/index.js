const express =require("express");
const app= express();
const PORT =8000;
const fs=require('fs');
const http=require("http").Server(app);
const cors=require("cors");

app.use(cors());

// Create Real Time Communication=>

const socketIO=require("socket.io")(http,{
    cors:{origin:"http://localhost:3001"}
});

let users=[];
let offUsers=[];

socketIO.on("connection",(socket)=>{
    console.log(`${socket.id} user just connected!`);

    socket.on("message",(data)=>{
        console.log(data);
        //sending to client side
        if(data.receiverId)socketIO.to(data.receiverId).to(data.socketID).emit("messageResponse",data);
        else socketIO.emit("messageResponse",data);
    });

    socket.on("newUser",(data)=>{
        users.push(data);
        socketIO.emit("newUserResponse",users);
    });
    socket.on("offRoomer",data=>{
        offUsers.push(data);
        socketIO.emit("offRoomerResponse",offUsers);
    })
    
    socket.on("typing",data=>{
        socket.broadcast.emit("typingResponse",data);
    });
    socket.on("removeTyping",data=>{
        socketIO.emit("removeTypingResponse",data);
    });
    socket.on('image', async image => {
        const buffer = Buffer.from(image, 'base64');
        await fs.writeFile('/tmp/image', buffer).catch(console.error); // fs.promises
        socketIO.emit('image', image.toString('base64')); 
    });

    socket.on("disconnect",()=>{
        console.log("A user disconnected!!!");
        users=users.filter(user=>user.id !== socket.id);
        offUsers=offUsers.filter(user=>user !== socket.id);
        socketIO.emit("newUserResponse",users);
        socket.disconnect();
    })
})
// Api End point:
app.get("/",(req,res)=>{
    res.json({message:"Hello There......"})
})
// Listening on PORT...........
http.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})