import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public, CurrentUser } from '../../common/decorators/tenant.decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await this.authService.login(dto, ip);
    return { data: result };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refreshTokens(refreshToken);
    return { data: result };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
  }
}
