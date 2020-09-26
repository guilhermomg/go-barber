import AppError from '@shared/errors/AppError';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    createAppointment = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationsRepository
    );
  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 8, 24, 12).getTime();
    });

    const appointment = await createAppointment.execute({
      date: new Date(2020, 8, 24, 13),
      provider_id: '123123',
      user_id: '456'
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123123');
  });

  it('should not be able to create two appointments on the same date/time', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 8, 24, 12).getTime();
    });

    const appointmentDate = new Date(2020, 8, 24, 13);

    await createAppointment.execute({
      date: appointmentDate,
      provider_id: '123123',
      user_id: '456'
    });

    await expect(createAppointment.execute({
      date: appointmentDate,
      provider_id: '123123',
      user_id: '456'
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 8, 24, 12).getTime();
    });

    await expect(createAppointment.execute({
      date: new Date(2020, 8, 24, 11),
      provider_id: '123123',
      user_id: '456'
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment if the user is also the provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 8, 24, 12).getTime();
    });

    await expect(createAppointment.execute({
      date: new Date(2020, 8, 24, 13),
      provider_id: '123123',
      user_id: '123123'
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 8, 24, 12).getTime();
    });

    await expect(createAppointment.execute({
      date: new Date(2020, 8, 25, 7),
      provider_id: 'provider-id',
      user_id: 'user-id'
    })).rejects.toBeInstanceOf(AppError);

    await expect(createAppointment.execute({
      date: new Date(2020, 8, 25, 18),
      provider_id: 'provider-id',
      user_id: 'user-id'
    })).rejects.toBeInstanceOf(AppError);
  });
});
