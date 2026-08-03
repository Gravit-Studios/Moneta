import { Controller, Delete, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.users.getProfile(req.user.userId);
  }

  @Get('export')
  exportData(@Req() req: AuthenticatedRequest) {
    return this.users.exportData(req.user.userId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.users.deleteAccount(req.user.userId);
  }
}
