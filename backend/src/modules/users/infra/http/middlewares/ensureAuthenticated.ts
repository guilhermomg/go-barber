import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticated(request: Request, response: Response, next: NextFunction): void {
  const authHeader = request.headers.authorization;

  if (!authHeader)
    throw new AppError("Token is missing.", 401);

  // Ignora a primeira posição do array retornado do split
  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);
    const { sub } = decoded as ITokenPayload;
    console.log(decoded);

    request.user = {
      id: sub
    };

    return next();
  }
  catch (err) {
    throw new AppError("Invalid JWt token.", 401);

  }


}
