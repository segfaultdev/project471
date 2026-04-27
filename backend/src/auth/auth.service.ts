import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null; // User not found
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      return null; // Wrong password
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const payload = { 
      email: user.email, 
      sub: user.id,      
      role: user.role    
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registerDto: RegisterDto) {

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: registerDto.role as any,
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
