import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'default-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Load permissions from user's assigned roles
    let permissions: string[] = [];
    if (!user.isSystemAdmin) {
      const roles = await this.dataSource.query(
        `SELECT DISTINCT r.permissions
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = $1`,
        [user.id],
      );
      const permSet = new Set<string>();
      for (const role of roles) {
        const perms = role.permissions || [];
        for (const p of perms) permSet.add(p);
      }
      permissions = Array.from(permSet);
    }

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isSystemAdmin: user.isSystemAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions,
    };
  }
}
