 
import  express from 'express'
import mongoose from 'mongoose'
 import process from 'process'
import  dotenv , { config  } from 'dotenv'
import { authRouter } from './api/user.js'
import EventEmitter from 'events';
import cookieParser from 'cookie-parser'
import {app , server} from './socket.io/socket.js'
import path from 'path'
import cors from "cors"

 dotenv.config({path : "../.env"});
const emitter = new EventEmitter();
emitter.setMaxListeners(20);
app.use(cors({ 
  origin: ["http://localhost:3000 " , "https://steller-mkwi.onrender.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}))
 const __dirname = path.resolve();


app.use(express.json());
app.use(cookieParser())

 

mongoose.connect(process.env.MONGO_DB_URL )
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('Error connecting to MongoDB:', err));
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});

app.use('/user' , authRouter);
 
app.get('/', (req, res) => {
  res.send('Hello');
});
 server.listen(3001 , ()=> console.log("server Start! "));
 
