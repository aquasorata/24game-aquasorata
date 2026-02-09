import { Injectable, UnauthorizedException } from '@nestjs/common';
import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';

const SESSION_DAYS = 14;

@Injectable()
export class AuthService {
  async login(username: string, password: string) {
    const usernameId = username.trim();
    const user = await prisma.user.findUnique({ where: { username: usernameId } });

    if (!user) throw new UnauthorizedException("Invalid credentials.");

    const checkPassword = await bcrypt.compare(password, user.passwordHash);
    if (!checkPassword) throw new UnauthorizedException("Invalid credentials.");

    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    return { userId: user.id, expiresAt: expiresAt };
  }

  async validateSession(userId: string) {
    const session = await prisma.user.findFirst({ where: { id: userId }});
    if (session) return { username: session.username, userId: session.id };
  }
}
