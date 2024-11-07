import cors from 'cors'
import  express from 'express'
import mongoose from 'mongoose'
 import process from 'process'
import  dotenv , { config  } from 'dotenv'
import { authRouter } from './Routes/user.js'
import EventEmitter from 'events';
import cookieParser from 'cookie-parser'
import {app , server} from './socket.io/socket.js'
import path from 'path'
 config();
const emitter = new EventEmitter();

 
 
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  credentials: true,  
}));
app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser())
 
mongoose.connect(process.env.MONGO_DB_URL)
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('Error connecting to MongoDB:', err));
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});

app.use('/user' , authRouter);

socketServer.attach(app);

// Export the app for Vercel's serverless environment
export default app;
