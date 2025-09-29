import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignupDTO,
  LoginDTO,
  AuthResponseDTO,
  MeUserDTO,
} from './dto/auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from './guards/auth.guard';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: SignupDTO })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async signup(
    @Body(ValidationPipe) signupDTO: SignupDTO,
  ): Promise<AuthResponseDTO> {
    return this.authService.signup(signupDTO);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDTO,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(
    @Body(ValidationPipe) loginDTO: LoginDTO,
  ): Promise<AuthResponseDTO> {
    return this.authService.login(loginDTO);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        full_name: { type: 'string', example: 'John Doe' },
        user_type: { type: 'string', example: 'student' },
        has_profile: { type: 'boolean', example: true },
        avatar_url: {
          type: 'string',
          example: 'https://example.com/avatar.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getMe(@CurrentUser() user): Promise<MeUserDTO> {
    return this.authService.getMe(user.user_id);
  }
}
