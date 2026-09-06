import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRouter from './Routes/userRoute.js'
import destinationRouter from './Routes/destinationRouter.js';
import tripRouter from './Routes/tripRouter.js';
import weatherRouter from './Routes/weatherRouter.js';
import reviewRouter from './Routes/reviewRouter.js';
import budgetRouter from './Routes/budgetRouter.js';
import savedItemRouter from './Routes/savedItemRouter.js';

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express();

// Build allowed origins list from env
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/user', userRouter)
app.use('/destinations', destinationRouter)
app.use('/trip', tripRouter)
app.use('/weather', weatherRouter)
app.use('/review', reviewRouter)
app.use('/budget', budgetRouter)
app.use('/saved', savedItemRouter)


app.get('/', (req, res) => {
  res.json({ message: 'YamuLK API is running', version: '1.0.0' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  })
})
