import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

type IRegister = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const Register = async (req: Request, res: Response) => {
  const { body } = req;
  const { firstName, lastName, email, password, confirmPassword } =
    body as IRegister;

  if (confirmPassword !== password) {
    return res.status(400).json({
      message: "Passwords don't match. Please try again.",
    });
  }

  const userRepository = AppDataSource.getRepository(User);
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
