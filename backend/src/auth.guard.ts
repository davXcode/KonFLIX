import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { supabaseAdmin } from './supabase';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth) throw new UnauthorizedException('No token');

    const token = auth.replace('Bearer ', '');

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) throw new UnauthorizedException('Invalid token');

    req.user = data.user;
    return true;
  }
}
