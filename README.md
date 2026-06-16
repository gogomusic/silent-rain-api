<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 描述

网站“静夜聆雨”的后端仓库项目，使用 `NestJS` 编写

## 项目设置

```bash
$ pnpm install
```

## 编译和运行项目

```bash
# development
$ pnpm dev

# build
$ pnpm build

# production mode
$ pnpm start:prod
```

## 测试

> [!warning]
>
> 单元测试、e2e测试还没学会，项目中未添加测试代码

## 部署

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## 总体开发进度

- [ ] 创建前台网站、后台管理系统和后端项目
- [ ] 部署到阿里云

  - [ ] 前台
  - [ ] 后台
  - [ ] 后端
- [X] 用户注册

  - [X] 注册
  - [X] 刷新页面后保留倒计时
- [X] 用户登录

  - [X] 登录
  - [ ] 增加验证方式（如滑块验证、验证码等）
  - [ ] 过期时间：短 Token（15 min）+ 长 Refresh Token（7 d）
- [X] 退出登录
- [X] 忘记密码找回功能
- [X] 权限管控
- [X] 日志
- [ ] TypeORM系统学习，及其迁移功能
- [ ] 文件上传：

  - [ ] 限制MIME类型、文件大小、文件后缀白名单
  - [ ] 设置文件类型为私有还是公有
  - [ ] 病毒扫描
  - [ ] 重复上传进行秒传
  - [ ] 下载时校验用户权限（通过元数据表）
  - [ ] 多文件上传、断点续传方案

## 常见BUG处理

### Error: A circular dependency has been detected (property key: "0"). Please, make sure that each side of a bidirectional relationships are using lazy resolvers ("type: () => ClassType").

在dto定义中，如果使用了枚举类型，则需要配置 `ApiProperty`装饰器，示例如下：

```
ts
  @ApiProperty({
    description: '状态：1:启用，0:禁用',
    default: 1,
    enum: StatusEnum,
    enumName: 'RoleStatusEnum',
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  @Type(() => Number)
  status?: StatusEnum;
```
