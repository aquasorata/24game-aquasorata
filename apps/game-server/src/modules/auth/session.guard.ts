import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const cookies = req.cookies as { sid?: string };
    const sid = cookies.sid;

    if (!sid) throw new UnauthorizedException("Missing session");

    const session = await this.auth.validateSession(sid);
    
    if (!session) throw new UnauthorizedException("Invalid session");
    
    req.session = session;

    return true
  }
}