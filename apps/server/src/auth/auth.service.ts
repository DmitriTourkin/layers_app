import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as userRepository from './user.repository';
import type { User } from "./user.repository";

const JWT_SECRET = process.env.JWT_SECRET!;

type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

async function register(email: string, password: string, name: string): Promise<PublicUser> {
  const exists = await userRepository.getUserByEmail(email);

  if (exists) throw new Error('Почта уже используется другим пользователем');
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser(email, passwordHash, name);

  return toPublicUser(user);
}

async function login(email: string, password: string): Promise<{token: string, user: PublicUser}> {
  const user = await userRepository.getUserByEmail(email);
  if (!user) throw new Error("Данные пользователя не найдены");

  const isMatchingPassword = bcrypt.compare(password, user.passwordHash);
  if (!isMatchingPassword) throw new Error("Пароль неверен");

  const token = jwt.sign({ userId: user.id}, JWT_SECRET, { expiresIn: '1h' });

  return { token, user: toPublicUser(user) }
}

export function verifyToken(token: string): { userId: string} {
  return jwt.verify(token, JWT_SECRET) as { userId: string} ;
}