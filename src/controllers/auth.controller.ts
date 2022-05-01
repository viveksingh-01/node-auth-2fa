import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

type IRegister = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ILogin = {
  email: string;
  password: string;
};

const userRepository = AppDataSource.getRepository(User);

export const Register = async (req: Request, res: Response) => {
  const { body } = req;
  const { firstName, lastName, email, password, confirmPassword } =
    body as IRegister;

  if (confirmPassword !== password) {
    return res.status(400).json({
      message: "Passwords don't match. Please try again.",
    });
  }

  const user = await userRepository.findOneBy({ email: email });
  if (email === user?.email) {
    return res
      .status(400)
      .json({ message: 'Email is already registered. Please try again.' });
  }

  const newUser = new User(
    firstName,
    lastName,
    email,
    await bcrypt.hash(password, 12)
  );
  await userRepository.save(newUser);

  return res.status(201).json({ message: 'User is registered successfully!' });
};

export const Login = async (req: Request, res: Response) => {
  const { body } = req;
  const { email, password } = body as ILogin;
  const user = await userRepository.findOneBy({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: 'Email or password is invalid. Please try again.' });
  }

  const accessToken = jwt.sign({ id: user.id }, 'ACCESS_SECRET', {
    expiresIn: '30s',
  });

  const refreshToken = jwt.sign({ id: user.id }, 'REFRESH_SECRET', {
    expiresIn: '1w',
  });

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ message: 'Logged in successfully!' });
};
