import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';
import { RedisService } from 'src/common/redis/redis.service';
import { compare, genSalt, hash } from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { DataSource } from 'typeorm';
import { StatusEnum, UserType } from 'src/common/enum/common.enum';
import { SysService } from 'src/sys/sys.service';
import { UserListReqDto } from './dto/user-list.req.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly sysService: SysService,
  ) {}

  /** 用户注册 */
  async register(createUserDto: CreateUserDto) {
    const captchaRedisKey = getRedisKey(
      RedisKeyPrefix.REGISTER_CODE,
      createUserDto.email,
    );
    const captcha = await this.redisService.get(captchaRedisKey);
    if (captcha !== createUserDto.captcha) {
      return ResponseDto.error('验证码错误', HttpStatus.EXPECTATION_FAILED);
    }
    const { username, email } = createUserDto;
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.username=:username OR u.email=:email', { username, email })
      .getOne();
    if (user) {
      return ResponseDto.error(
        '用户名或邮箱已存在，请重新输入',
        HttpStatus.CONFLICT,
      );
    }
    if (createUserDto.password !== createUserDto.confirm) {
      return ResponseDto.error(
        '两次输入的密码不一致',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const salt = await genSalt();
    const pwd = this.sysService.decrypt(
      createUserDto.key_id,
      createUserDto.password,
    );
    const password = await hash(pwd, salt);
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
      key_id: _keyId,
      public_key: _publicKey,
      ...rest
    } = (await this.userRepository.save(newUser)) as Partial<
      User & CreateUserDto
    >;
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, rest.id);
    await this.redisService.hSet(redisKey, rest);
    return ResponseDto.success(null, '注册成功');
  }

  /** 验证用户 */
  async validateUser(username: string, password: string, key_id: string) {
    const encryptedPwd = this.sysService.decrypt(key_id, password);
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      return ResponseDto.error('账号或密码错误', HttpStatus.EXPECTATION_FAILED);
    }
    const checkPassword = await compare(encryptedPwd, user.password);
    if (!checkPassword) {
      return ResponseDto.error('账号或密码错误', HttpStatus.EXPECTATION_FAILED);
    }
    if (user.status === StatusEnum.DISABLED) {
      return ResponseDto.error('此账号已被禁用', HttpStatus.FORBIDDEN);
    }
    return ResponseDto.success({
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
    });
  }

  /** 查找用户信息 */
  async findOne(
    _user: { id: number; user_type?: UserType },
    isGetPerm = false,
  ) {
    const { id, user_type } = _user;
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        'u.id AS id',
        'u.username AS username',
        'u.nickname AS nickname',
        'u.email AS email',
        'u.user_type AS user_type',
        'u.status AS status',
        'u.avatar AS avatar',
        'u.description AS description',
        'u.create_time AS create_time',
        'u.update_time AS update_time',
        'ur.role_id AS role_id',
        'p.code AS permission_code',
        'f.id AS avatar_file_id',
        'f.key AS avatar_file_path',
        'f.original_name AS avatar_file_original_name',
      ])
      .from('user', 'u')
      .leftJoin('user_role', 'ur', 'u.id = ur.user_id')
      .leftJoin('role_permission', 'rp', 'ur.role_id=rp.role_id')
      .leftJoin('permission', 'p', 'rp.permission_id = p.id')
      .leftJoin('file', 'f', 'u.avatar = f.id')
      .where('u.id = :id', { id });

    const enrichedData: (User & {
      role_id?: number;
      permission_code?: string;
      avatar_file_id?: number;
      avatar_file_path?: string;
      avatar_file_original_name?: string;
    })[] = await queryBuilder.getRawMany();

    if (enrichedData.length === 0)
      return ResponseDto.error('用户不存在', HttpStatus.NOT_FOUND);

    const roles = enrichedData.reduce((acc, row) => {
      if (row.role_id && !acc.includes(row.role_id)) {
        acc.push(row.role_id);
      }
      return acc;
    }, [] as number[]);

    let permissions: string[] = [];
    if (isGetPerm) {
      if (user_type === UserType.ADMIN_USER) {
        const allPerms: { code: string }[] = await this.dataSource
          .createQueryBuilder()
          .select(['p.code AS code'])
          .from('permission', 'p')
          .getRawMany();
        permissions = allPerms.map((item) => item.code);
      } else
        permissions = enrichedData.reduce((acc, row) => {
          if (row.permission_code && !acc.includes(row.permission_code)) {
            acc.push(row.permission_code);
          }
          return acc;
        }, [] as string[]);
    }

    const user = {
      ...enrichedData[0],
      roles,
      permissions: isGetPerm ? permissions : undefined,
      avatar_info: {
        file_id: enrichedData[0].avatar_file_id,
        file_path: enrichedData[0].avatar_file_path,
        file_original_name: enrichedData[0].avatar_file_original_name,
      },
    };
    delete user.role_id;
    delete user.permission_code;
    delete user.avatar_file_id;
    delete user.avatar_file_path;
    delete user.avatar_file_original_name;

    return user;
  }

  logout(_user_id: number) {
    // TODO 登出
    return ResponseDto.success();
  }

  /** 获取用户列表(分页) */
  async getUserList(dto?: UserListReqDto) {
    const { current = 1, pageSize = 10, username, status } = dto || {};
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('file', 'f', 'u.avatar = f.id')
      .select([
        'u.id AS id',
        'u.username AS username',
        'u.nickname AS nickname',
        'u.email AS email',
        'u.status AS status',
        'u.avatar AS avatar',
        'u.description AS description',
        'u.create_time AS create_time',
        'u.update_time AS update_time',
        'f.id AS avatar_file_id',
        'f.key AS avatar_file_path',
        'f.original_name AS avatar_file_original_name',
      ])
      .orderBy('u.update_time', 'DESC')
      .skip((current - 1) * pageSize)
      .take(pageSize);

    if (username) {
      queryBuilder.where('u.username LIKE :username', {
        username: `%${username}%`,
      });
    }
    if (typeof status !== 'undefined') {
      queryBuilder[username ? 'andWhere' : 'where']('u.status = :status', {
        status,
      });
    }

    const users: (User & {
      avatar_file_id?: number;
      avatar_file_path?: string;
      avatar_file_original_name?: string;
    })[] = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();
    const list = users.map((user) => {
      const {
        avatar_file_id,
        avatar_file_path,
        avatar_file_original_name,
        ...rest
      } = user;
      const avatar_info = {
        file_id: user.avatar_file_id as number,
        file_path: user.avatar_file_path as string,
        file_original_name: user.avatar_file_original_name as string,
      };
      return {
        ...rest,
        avatar_info,
      };
    });

    return ResponseDto.success({
      list,
      total,
      current,
      pageSize,
    });
  }

  /** 更新个人资料 */
  async updateSelf(updateSelfDto: UpdateSelfDto) {
    const { id } = updateSelfDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return ResponseDto.error('用户不存在', HttpStatus.NOT_FOUND);
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
    const {
      password: _password,
      salt: _salt,
      ...rest
    } = result as Partial<User & UpdateSelfDto>;
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, rest.id);
    await this.redisService.hSet(redisKey, rest);
    return ResponseDto.success(null, '更新成功');
  }

  /** 修改用户状态 */
  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const { id, status } = changeStatusDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return ResponseDto.error('用户不存在', HttpStatus.NOT_FOUND);
    }
    const updatedUser = plainToInstance(
      User,
      {
        ...user,
        status,
      },
      {
        ignoreDecorators: true,
      },
    );
    const result = await this.userRepository.save(updatedUser);
    const {
      password: _password,
      salt: _salt,
      ...rest
    } = result as Partial<User>;
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, rest.id);
    await this.redisService.hSet(redisKey, rest);
    return ResponseDto.success(null, '更新成功');
  }
}
