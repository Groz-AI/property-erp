import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string | null;
  isSystemAdmin: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string | null;
    isSystemAdmin: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ip: string): Promise<TokenResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block login if the user's tenant is deactivated (skip for super admins with no tenant)
    if (user.tenantId && !user.isSystemAdmin) {
      const tenant = await this.tenantRepo.findOne({ where: { id: user.tenantId } });
      if (!tenant || !tenant.isActive) {
        throw new UnauthorizedException('Your organization account has been deactivated. Contact the platform administrator.');
      }
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      }
      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;

    const tokens = await this.generateTokens(user);

    // Store refresh token hash
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepo.save(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        isSystemAdmin: user.isSystemAdmin,
      },
    };
  }

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: dto.tenantId || null,
      isActive: true,
    });

    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepo.save(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        isSystemAdmin: user.isSystemAdmin,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepo.save(user);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  async validateUser(payload: JwtPayload): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }

  private async generateTokens(user: UserEntity): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isSystemAdmin: user.isSystemAdmin,
    };

    const expiresIn = parseInt(this.configService.get('JWT_EXPIRY', '900'), 10);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: parseInt(this.configService.get('JWT_REFRESH_EXPIRY', '604800'), 10),
      }),
    ]);

    return { accessToken, refreshToken, expiresIn };
  }
}
