import { Router, Request, Response } from 'express';
import * as authService from "./auth.service";
import * as userRepository from './user.repository';

export const authRouter = Router();

authRouter.post('/login', loginHandler);
authRouter.post('/register', registerHandler);

async function loginHandler(req: Request, res: Response) {
  const { email, password} = req.body;

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (e) {
    if (e instanceof Error && (e.message === 'Пароль неверен' || e.message === 'Данные пользователя не найдены')) {
      return res.status(401).json({ error: 'invalid credentials'});
    }
    return res.status(500).json({ error: 'Ошибка сервера'});
  }
}

async function registerHandler(req: Request, res: Response) {
  const { email, password, name } = req.body;

  try {
    const user = await authService.register(email, password, name);
    res.status(201).json(user);
  } catch (e) {
    if (e instanceof Error && e.message === "Почта уже используется другим пользователем") {
      res.status(409).json({error: "Почта занята"})
    }
    res.status(500).json({error: "Ошибка сервера"});
  }
}