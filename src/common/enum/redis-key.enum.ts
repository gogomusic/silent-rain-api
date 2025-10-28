/** Redis键前缀 */
export const enum RedisKeyPrefix {
  /** 注册验证码 */
  REGISTER_CODE = 'registry_code:',
  /** 修改密码验证码 */
  CHANGE_PWD_CODE = 'change_pwd_code:',
  /** 邮件服务 */
  EMAIL_SERVICE = 'email_service:',
  /** 用户信息 */
  USER_INFO = 'user:info:',
  /** token黑名单 */
  TOKEN_BLACK_LIST = 'token:blacklist',
}
