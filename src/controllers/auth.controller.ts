import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const userRepository = AppDataSource.getRepository(User);

export const signup = async (req: Request, res: Response) => {
  const { body } = req;
  const { firstName, lastName, email, password, confirmPassword } =
    body as RegisterPayload;
  if (confirmPassword !== password) {
    return res.status(400).json({
      message: "Passwords don't match. Please try again.",
    });
  }
  const user = await userRepository.findOneBy({ email });
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
  return res.status(201).json({ message: `You've signed up successfully!` });
};

export const login = async (req: Request, res: Response) => {
  const { body } = req;
  const { email, password } = body as LoginPayload;
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

  if (user.secret2FA) {
    return res.status(200).json({
      id: user.id,
    });
  }

  const secret = speakeasy.generateSecret({
    name: 'Svelte 2FA',
  });

  return res.status(200).json({
    id: user.id,
    secret: secret.ascii,
    otpAuthUrl: secret.otpauth_url,
  });
};

export const process2FAuth = async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const secret = user.secret2FA || req.body.secret;
    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: 'ascii',
      token: req.body.code,
    });
    if (!isVerified) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    if (!user.secret2FA) {
      await userRepository.update(id, { secret2FA: secret });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET || '',
      {
        expiresIn: '30s',
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || '',
      {
        expiresIn: '1w',
      }
    );
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ message: `You've logged in successfully!`, token: accessToken });
  } catch (e) {
    return res.status(400).json({
      message: 'Invalid credentials',
    });
  }
};

export const getLoggedinUser = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('Authorization')?.split(' ')[1] || '';
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET || ''
    ) as any;
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }
    const user = await userRepository.findOneBy({ id: payload.id });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }
    const { password, ...data } = user;
    return res.status(200).json({ ...data });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: 'Unauthorized access.' });
  }
};

export const refreshAccessToken = (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || ''
    ) as any;
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }
    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.ACCESS_TOKEN_SECRET || '',
      {
        expiresIn: '30s',
      }
    );
    res.status(200).json({
      message: 'Access Token refreshed successfully!',
      token: accessToken,
    });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: 'Unauthorized access.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('refresh_token', '', { maxAge: 0 });
  return res.status(200).json({ message: `You've logged out successfully!` });
};
