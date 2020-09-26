import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import CreateUserService from './CreateUserService';
import AuthenticateUserService from './AuthenticateUserService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let createUser: CreateUserService;
let authenticateUser: AuthenticateUserService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(fakeUsersRepository, fakeHashProvider);
    authenticateUser = new AuthenticateUserService(fakeUsersRepository, fakeHashProvider);
  });

  it('should be able to authenticate', async () => {
    await createUser.execute({
      name: 'John Doe',
      email: 'johndoe@test.com',
      password: '123456'
    });

    const user = await authenticateUser.execute({
      email: 'johndoe@test.com',
      password: '123456'
    });

    expect(user).toHaveProperty('token');
  });

  it('should not be able to authenticate with non-existing user', async () => {
    await expect(authenticateUser.execute({
      email: 'johndoe@test.com',
      password: '123456'
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with a wrong password', async () => {
    await createUser.execute({
      name: 'John Doe',
      email: 'johndoe@test.com',
      password: '123456'
    });

    await expect(authenticateUser.execute({
      email: 'johndoe@test.com',
      password: 'wrong-password'
    })).rejects.toBeInstanceOf(AppError);
  });
});
