/** Redis键前缀 */
export const enum RedisKeyPrefix {
  /** 注册验证码 */
  REGISTER_CODE = 'registry_code:',
  /** 修改密码验证码 */
  CHANGE_PWD_CODE = 'change_pwd_code:',
  /** 邮件服务 */
  EMAIL_LIMIT = 'email:limit:',
  /** 用户信息 */
  USER_INFO = 'user:info:',
  /** 用户权限标识 */
  USER_PERMS = 'user:perms:',
  /** Token黑名单 */
  TOKEN_BLACKLIST = 'token:blacklist:',
  /** 字典数据 */
  DICT = 'dict:',
}
