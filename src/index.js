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
const allowedOriginRegex = /^https:\/\/media-4ba1(-[a-zA-Z0-9]+)?\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOriginRegex.test(origin)) {
      
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

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
 

// Export the app for Vercel's serverless environment
export default app;
