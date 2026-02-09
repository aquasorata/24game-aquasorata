import { Injectable, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';
import type { BootstrapDto } from './users.dto';

@Injectable()
export class UsersService {
  async bootstrap(input: BootstrapDto) {
    const username = input.username.trim();
    const existing = await prisma.user.findUnique({ where: { username } });

    if (existing) throw new ConflictException('username_taken');

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        elo: true,
        createdAt: true,
      },
    });

    return user;
  }

  async validatePassword(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    return { id: user.id, username: user.username, elo: user.elo };
  }
}
