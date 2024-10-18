import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

const users: User[] = [];
const router = express.Router();

// GET all users
router.get('/', (req: Request, res: Response) => {
  res.status(200).json(users);
});

// GET user by ID
router.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
});

// POST create user
router.post('/', (req: Request, res: Response) => {
  const { username, age, hobbies } = req.body;

  if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newUser: User = { id: uuidv4(), username, age, hobbies };
  users.push(newUser);
  
  res.status(201).json(newUser);
});

// PUT update user
router.put('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { username, age, hobbies } = req.body;
  
  if (username !== undefined) users[index].username = username;
  if (age !== undefined) users[index].age = age;
  if (hobbies !== undefined) users[index].hobbies = hobbies;
  
  res.status(200).json(users[index]);
});

// DELETE user
router.delete('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!isValidUUID(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(index, 1);
  res.status(204).send();
});

// Helper function to validate UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const usersRouter = router;
