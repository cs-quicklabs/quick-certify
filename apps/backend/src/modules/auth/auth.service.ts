import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserModel, SessionModel } from '@/models';
import { UserService } from '@/modules/user/user.service';
import { LoginDto } from './dto';
import Helpers from '@/utils/helper';
import { SessionService } from '@/modules/session/session.service';
import { AllConfigType } from '@/config/config.type';
import ms from 'ms';

@Injectable()
export class AuthService {
  private accessTokenSecret: string;
  private accessTokenExpiresIn: string;

  private refreshTokenSecret: string;
  private refreshTokenExpiresIn: string;
  private refreshTokenRememberMeExpiresIn: string;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly sessionService: SessionService
  ) {
    this.accessTokenSecret = this.configService.get('auth.accessTokenSecret', {
      infer: true,
    });
    this.accessTokenExpiresIn = this.configService.get(
      'auth.accessTokenExpires',
      { infer: true }
    );

    this.refreshTokenSecret = this.configService.get(
      'auth.refreshTokenSecret',
      {
        infer: true,
      }
    );
    this.refreshTokenExpiresIn = this.configService.get(
      'auth.refreshTokenExpires',
      { infer: true }
    );
    this.refreshTokenRememberMeExpiresIn = this.configService.get(
      'auth.refreshTokenRememberMeExpires',
      { infer: true }
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const hash = Helpers.generateRandomHash();
    const refreshTokenExpiresIn = loginDto.rememberMe
      ? this.refreshTokenRememberMeExpiresIn
      : this.refreshTokenExpiresIn;
    const session = await this.sessionService.create({
      userId: user.id,
      hash,
      expiresAt: new Date(Date.now() + ms(refreshTokenExpiresIn)),
    });
    session.user = user;

    const accessToken = await this.generateAccessToken(session);
    const refreshToken = await this.generateRefreshToken(
      session,
      loginDto.rememberMe
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    const session = await this.jwtService.decode(token);
    if (session) {
      const data = await this.sessionService.getOneByPk(session.sessionId);
      if (data) {
        await data.destroy();
      }
    }
  }

  async validateUser(email: string, password: string): Promise<UserModel> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    return user;
  }

  generateRefreshToken(session: SessionModel, rememberMe: boolean) {
    const payload = {
      sessionId: session.id,
      hash: session.hash,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: rememberMe
        ? this.refreshTokenRememberMeExpiresIn
        : this.refreshTokenExpiresIn,
    });
  }

  generateAccessToken(session: SessionModel) {
    const user = session.user;

    const payload = {
      id: user.id,
      sessionId: session.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }
}
