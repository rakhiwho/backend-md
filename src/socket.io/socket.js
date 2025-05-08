import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ChildProcess } from "child_process";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const userSocketMap = {}; //userId : soketId

export const getRecieverSocketID = (receiverID) => {
  return userSocketMap[receiverID];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const userId = new mongoose.Types.ObjectId(socket.handshake.query.userId);

  if (userId != undefined) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  
  // joining the room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`user with id ${userId}  joined the room ${userId}`);
  });


  // calling method
  socket.on("callUser", (data) => {
    const { userToCall, signalData, from, name } = data;
    console.log(`call from ${from} to ${userToCall}`);
    io.to(userToCall).emit("callIncoming", { signal: signalData, from, name });
  });
  
 
  // handle call initiation

  socket.on("acceptCall", (data) => {
    const { signal, to } = data;
    console.log(`call accepted by ${socket.id} , notify ${to}`);
    io.to(to).emit("callAccepted", signal);
  });

  // handling ICE candidate
  socket.on("ice-candidate", (data) => {
    const { userToCall, candidate } = data;

    console.log(`ICE candodate from ${socket.io} to ${userToCall}`);

    io.to(userToCall).emit("ice-candidate", candidate);
  });
  // end call
  socket.on("endCall", (data) => {
    const { to } = data;
    console.log(`call terminated with ${to}`);

    io.to(to).emit("end call");
  });

  // disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
