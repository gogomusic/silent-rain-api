import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { MailService } from 'src/common/mail/mail.service';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { getRedisKey } from 'src/common/utils/redis';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { UserChangePwdDto } from './dto/user-change-pwd.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { UserRole } from './entities/user-role.entity';
import { RoleService } from 'src/role/role.service';
import { UserResetPwdDto } from './dto/user-reset-pwd.dto';
import { plainToInstance } from 'class-transformer';
import { UserSetRolesDto } from './dto/user-set-roles.dto';
import { UserUpdateSelfDto } from './dto/user-update-self.dto';
import { UserListDto } from './dto/user-list.dto';
import { formatDate, ListResult } from 'src/common/utils';
import { UserType } from 'src/common/enums/common.enum';
import { FileService } from 'src/common/file/file.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
    private readonly roleService: RoleService,
    private readonly fileService: FileService,
  ) {}

  /** 通过用户ID查找用户信息 */
  async findOneById(id: number, isCurrent: boolean = false) {
    // 非当前用户优先查缓存
    if (!isCurrent) {
      const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, id);
      const cachedRaw = await this.redisService.get(redisKey);
      if (cachedRaw) {
        return JSON.parse(cachedRaw) as User;
      }
    }
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, id);
    await this.redisService.set(redisKey, JSON.stringify(user));

    if (isCurrent) {
      const userRoles = await this.userRoleRepository.find({
        where: { userId: id },
      });
      user.roles = userRoles.map((ur) => ur.roleId);

      // 超管拥有所有权限，无需按角色过滤
      if (user.type === UserType.ADMIN_USER) {
        const perms = await this.dataSource
          .createQueryBuilder()
          .select(['permission'])
          .from('menu', 'm')
          .where('m.permission IS NOT NULL')
          .getRawMany();
        user.permissions = perms.map((item) => item.permission).sort();
      } else if (userRoles.length > 0) {
        const perms = await this.dataSource
          .createQueryBuilder()
          .select(['DISTINCT m.permission AS permission'])
          .from('role_menu', 'rm')
          .leftJoin('menu', 'm', 'rm.menu_id = m.id')
          .where('rm.role_id IN (:...roleIds)', {
            roleIds: user.roles,
          })
          .andWhere('m.permission IS NOT NULL')
          .getRawMany();
        user.permissions = perms.map((item) => item.permission).sort();
      }
    }

    if (user.avatar) {
      const avatarInfo = await this.fileService.findFileInfo(user.avatar);
      user.avatarInfo = avatarInfo
        ? {
            fileId: avatarInfo.id,
            filePath: avatarInfo.key,
            fileOriginalName: avatarInfo.originalName,
          }
        : null;
    }

    return user;
  }

  /** 通过用户名查找用户信息 */
  findOneByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }

  /** 通过用户ID查找用户信息(含密码) ，仅认证服务需要使用*/
  findOneByUsernameWithPwd(username: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username=:username', { username })
      .getOne();
  }

  /** 通过邮箱查找用户信息(含密码) ，仅认证服务需要使用*/
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
    await this.redisService.set(redisKey, captcha, 5 * 60); // 设置验证码有效期为5分钟
    return ResponseDto.success();
  }

  /** 用户注册 */
  async create(registerDto: UserRegisterDto) {
    const { password, confirmPassword, ...rest } = registerDto;

    if (password !== confirmPassword) {
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

    await this.mailService.sendWelcome(user.email, user.nickname);
    const newUser = await this.userRepository.save(user);
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, newUser.id);
    await this.redisService.set(redisKey, JSON.stringify(newUser));
    const { id: roleId } = await this.roleService.createGuestRole();
    await this.userRoleRepository.save(
      plainToInstance(
        UserRole,
        {
          userId: newUser.id,
          roleId: roleId,
        },
        {
          ignoreDecorators: true,
        },
      ),
    );

    return newUser;
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
    await this.redisService.set(redisKey, captcha, 5 * 60);
    return ResponseDto.success();
  }

  /** 重置密码 */
  async resetPassword(dto: UserResetPwdDto) {
    const { email, captcha, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new UnprocessableEntityException('两次输入的密码不一致');
    }

    // 验证验证码
    const redisKey = getRedisKey(RedisKeyPrefix.CHANGE_PWD_CODE, email);
    const storedCaptcha = await this.redisService.get(redisKey);
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
    await this.redisService.del(redisKey);

    return ResponseDto.success();
  }

  /** 修改密码（需登录） */
  async changePassword(userId: number, dto: UserChangePwdDto) {
    const { oldPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
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

  async setRoles(dto: UserSetRolesDto) {
    const { id, roles } = dto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return ResponseDto.fail(HttpStatus.NOT_FOUND, '用户不存在');
    }
    await this.userRoleRepository.delete({ userId: id });
    const userRoles = roles.map((roleId) =>
      plainToInstance(
        UserRole,
        {
          userId: id,
          roleId,
        },
        {
          ignoreDecorators: true,
        },
      ),
    );
    if (userRoles.length > 0) {
      await this.userRoleRepository.save(userRoles);
    }
    // 清除该用户的权限缓存
    const permKey = getRedisKey(RedisKeyPrefix.USER_PERMS, id);
    await this.redisService.del(permKey);
    return ResponseDto.success();
  }

  /** 更新个人资料 */
  async updateSelf(updateSelfDto: UserUpdateSelfDto) {
    const { id } = updateSelfDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return ResponseDto.fail(HttpStatus.NOT_FOUND, '用户不存在');
    }
    const updatedUser = plainToInstance(
      User,
      {
        ...user,
        ...updateSelfDto,
      },
      {
        ignoreDecorators: true,
      },
    );
    const result = await this.userRepository.save(updatedUser);

    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, result.id);
    await this.redisService.set(redisKey, JSON.stringify(result));
    return ResponseDto.success();
  }

  /** 更新用户上次登录时间 */
  async updateLastLoginAt(userId: number) {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
    // 清除缓存，下次查询时重新加载
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, userId);
    await this.redisService.del(redisKey);
  }

  /** 获取用户列表(分页) */
  async getUserList(dto: UserListDto) {
    const { current, pageSize, username, status } = dto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('file', 'f', 'u.avatar = f.id')
      .select([
        'u.id AS id',
        'u.username AS username',
        'u.nickname AS nickname',
        'u.email AS email',
        'u.status AS status',
        'u.avatar AS avatar',
        'u.description AS description',
        'u.last_login_at AS lastLoginAt',
        'u.created_at AS createdAt',
        'u.updated_at AS updatedAt',
        'f.id AS avatarFileId',
        'f.key AS avatarFilePath',
        'f.original_name AS avatarFileOriginalName',
      ])
      .orderBy('u.updated_at', 'DESC');

    // 按条件筛选
    if (username) {
      queryBuilder.andWhere('u.username LIKE :username', {
        username: `%${username}%`,
      });
    }
    if (typeof status !== 'undefined') {
      queryBuilder.andWhere('u.status = :status', { status });
    }

    // 分页
    queryBuilder.skip((current - 1) * pageSize).take(pageSize);

    // 并行查询用户列表和总数
    const [users, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);

    // 批量查询用户角色，构建 roleId 映射
    const userIds = users.map((user) => user.id);
    const userRoles = userIds.length
      ? await this.userRoleRepository
          .createQueryBuilder('ur')
          .where('ur.user_id IN (:...userIds)', { userIds })
          .getMany()
      : [];
    const roleMap = new Map<number, number[]>();
    for (const row of userRoles) {
      if (roleMap.has(row.userId)) {
        roleMap.get(row.userId)!.push(row.roleId);
      } else {
        roleMap.set(row.userId, [row.roleId]);
      }
    }

    // 组装返回数据
    const list = users.map((user) => {
      const {
        avatarFileId: _fileId,
        avatarFilePath: _filePath,
        avatarFileOriginalName: _fileOriginalName,
        ...rest
      } = user;
      return {
        ...rest,
        status: !!user.status,
        createdAt: formatDate(user.createdAt as string),
        updatedAt: formatDate(user.updatedAt as string),
        lastLoginAt: formatDate(user.lastLoginAt as string),
        avatarInfo: user.avatarFileId
          ? {
              fileId: user.avatarFileId,
              filePath: user.avatarFilePath,
              fileOriginalName: user.avatarFileOriginalName,
            }
          : null,
        roles: roleMap.get(Number(user.id)) || [],
      };
    });

    return new ListResult(list, total);
  }
}
