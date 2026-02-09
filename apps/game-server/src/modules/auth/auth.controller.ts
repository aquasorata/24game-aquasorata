import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionGuard } from './session.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth:AuthService) {}

  @Post("login")
  async login(
    @Body() body: { username: string, password: string },
    @Res({ passthrough: true }) res:Response
  ) {
    const session = await this.auth.login(body.username, body.password);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("sid", session.userId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 14,
    });

    return { ok: true };
  }

  @Post("logout")
  logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("sid", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });
    
    return { ok:true };
  }

  @UseGuards(SessionGuard)
  @Get('me')
  me(@Req() req: Request) {
    console.log('SessionGuard userId: ', req.session?.userId);
    console.log('SessionGuard username: ', req.session?.username);
    return { userId: req.session?.userId, username: req.session?.username }
  }
}
