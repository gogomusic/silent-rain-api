import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Get, Param, Req } from '@nestjs/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from 'src/common/auth/auth.service';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: '登录',
  })
  @Post('login')
  @ApiGenericResponse('用户登录成功', String)
  @UseGuards(LocalAuthGuard)
  login(@Body() _loginUserDto: LoginUserDto, @Req() req: { user: User }) {
    return this.authService.generateAccessToken(req.user);
  }
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @ApiOperation({
    summary: '获取用户信息',
  })
  @ApiGenericResponse('用户信息', UserInfoDto)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
