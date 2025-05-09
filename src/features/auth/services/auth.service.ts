// SERVER / CLIENT

import { Env } from '@/core/config/Env';
import { httpService } from '@/shared/services/http.services';

class LoginService {
  private static instance: LoginService;

  private constructor() { }

  public static getInstance(): LoginService {
    if (!LoginService.instance) {
      LoginService.instance = new LoginService();
    }
    return LoginService.instance;
  }

  public async login(
    options: { email: string; password: string },
  ): Promise<any> {
    const data = await httpService.post(`${Env.NEXT_PUBLIC_API_SERVER}/auth/login`, options);
    return data;
  }
}

export const loginService = LoginService.getInstance();
