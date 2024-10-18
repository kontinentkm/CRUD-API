import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { usersRouter } from './users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api/users', usersRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
