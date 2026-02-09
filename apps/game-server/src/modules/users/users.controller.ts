import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { BootstrapSchema } from './users.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('bootstrap')
  async bootstrap(@Body() body: unknown) {
    const parsed = BootstrapSchema.safeParse(body);

    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const user = await this.users.bootstrap(parsed.data);
    return { ok: true, user };
  }
}
