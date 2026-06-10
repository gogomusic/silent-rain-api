import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { MailService } from 'src/common/mail/mail.service';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { getRedisKey } from 'src/common/utils/redis';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import Redis from 'ioredis';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { ResetPwdDto } from './dto/reset-pwd.dto';
import { ChangePwdDto } from './dto/change-pwd.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /** 通过用户ID查找用户信息 */
  findOneById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  /** 通过用户名查找用户信息 */
  findOneByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }

  /** 通过用户ID查找用户信息(含密码) */
  findOneByUsernameWithPwd(username: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username=:username', { username })
      .getOne();
  }
  /** 通过邮箱查找用户信息(含密码) */
  findOneByEmailWithPwd(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email=:email', { email })
      .getOne();
  }

  /** 发送注册邮箱验证码 */
  async sendMailForRegister(email: string) {
    const captcha = Math.random().toString().slice(-6);
    await this.mailService.sendVerificationCode(email, captcha);
    const redisKey = getRedisKey(RedisKeyPrefix.REGISTER_CODE, email);
    await this.redis.setex(redisKey, 5 * 60, captcha); // 设置验证码有效期为5分钟
    return ResponseDto.success();
  }

  async create(registerDto: UserRegisterDto) {
    const { password, confirm, ...rest } = registerDto;

    if (password !== confirm) {
      throw new UnprocessableEntityException('两次输入的密码不一致');
    }

    // 检查用户名或邮箱是否已存在
    const exists = await this.userRepository.findOne({
      where: [{ username: rest.username }, { email: rest.email }],
    });
    if (exists) {
      const field = exists.username === rest.username ? '用户名' : '邮箱';
      throw new UnprocessableEntityException(`${field}已被注册`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  /** 发送重置密码验证码 */
  async sendMailForResetPassword(email: string) {
    console.log(email);
    // 检查邮箱是否存在
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnprocessableEntityException('该邮箱尚未注册');
    }

    const captcha = Math.random().toString().slice(-6);
    await this.mailService.sendVerificationCode(email, captcha);
    const redisKey = getRedisKey(RedisKeyPrefix.CHANGE_PWD_CODE, email);
    await this.redis.setex(redisKey, 5 * 60, captcha);
    return ResponseDto.success();
  }

  /** 重置密码 */
  async resetPassword(dto: ResetPwdDto) {
    const { email, captcha, password, confirm } = dto;

    if (password !== confirm) {
      throw new UnprocessableEntityException('两次输入的密码不一致');
    }

    // 验证验证码
    const redisKey = getRedisKey(RedisKeyPrefix.CHANGE_PWD_CODE, email);
    const storedCaptcha = await this.redis.get(redisKey);
    if (!storedCaptcha || storedCaptcha !== captcha) {
      throw new UnprocessableEntityException('验证码错误或已过期');
    }

    // 查找用户
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnprocessableEntityException('该邮箱尚未注册');
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });

    // 删除验证码
    await this.redis.del(redisKey);

    return ResponseDto.success();
  }

  /** 修改密码（需登录） */
  async changePassword(userId: number, dto: ChangePwdDto) {
    const { oldPassword, newPassword, confirmNewPassword } = dto;

    if (newPassword !== confirmNewPassword) {
      throw new UnprocessableEntityException('两次输入的密码不一致');
    }

    if (oldPassword === newPassword) {
      throw new UnprocessableEntityException('新密码不能与旧密码相同');
    }

    // 验证旧密码
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnprocessableEntityException('用户不存在');
    }

    const isOldPwdValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPwdValid) {
      throw new UnprocessableEntityException('旧密码错误');
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return ResponseDto.success();
  }
}
