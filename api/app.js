import express from 'express';
import authRoute from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = new express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);

app.listen(8800, ()=> {
    console.log("Server listening")
});