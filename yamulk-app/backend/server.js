import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRouter from './Routes/userRoute.js'
import destinationRouter from './Routes/destinationRouter.js';
import tripRouter from './Routes/tripRouter.js';
import weatherRouter from './Routes/weatherRouter.js';
import reviewRouter from './Routes/reviewRouter.js'

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express();

// Allow the Vite dev server to call this API
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/user',userRouter)
app.use('/destinations',destinationRouter)
app.use('/trip',tripRouter)
app.use('/weather',weatherRouter)
app.use('/review',reviewRouter)


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

connectDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  })
})

