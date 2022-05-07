import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';

require('dotenv').config();

AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to the database.');

    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({ credentials: true, origin: true }));

    app.use('/api', authRouter);

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server started and listening at port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
