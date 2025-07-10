import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';
import { RedisService } from 'src/common/redis/redis.service';
import { genSalt, hash } from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const captchaRedisKey = getRedisKey(
      RedisKeyPrefix.REGISTER_CODE,
      createUserDto.email,
    );
    const captcha = await this.redisService.get(captchaRedisKey);
    if (captcha !== createUserDto.captcha) {
      throw new HttpException('验证码错误', HttpStatus.EXPECTATION_FAILED);
    }
    const { username, email } = createUserDto;
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.username=:username OR u.email=:email', { username, email })
      .getOne();
    if (user) {
      throw new HttpException(
        '用户名或邮箱已存在，请重新输入',
        HttpStatus.CONFLICT,
      );
    }
    if (createUserDto.password !== createUserDto.confirm) {
      throw new HttpException(
        '两次输入的密码不一致',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const salt = await genSalt();
    const password = await hash(createUserDto.password, salt);
    const newUser = plainToInstance(
      User,
      {
        ...createUserDto,
        password,
        salt,
      },
      {
        ignoreDecorators: true,
      },
    );
    const {
      username: _username,
      password: _password,
      confirm: _confirm,
      captcha: _captcha,
      salt: _salt,
      ...rest
    } = (await this.userRepository.save(newUser)) as Partial<
      User & CreateUserDto
    >;
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, rest.id);
    await this.redisService.hSet(redisKey, rest);
    return {
      code: 0,
      message: '注册成功',
      data: rest,
    };
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
