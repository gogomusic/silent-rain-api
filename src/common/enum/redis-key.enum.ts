/** Redis键前缀 */
export const enum RedisKeyPrefix {
  /** 验证码 */
  REGISTER_CODE = 'registry_code:',
  /** 邮件服务 */
  EMAIL_SERVICE = 'email_service:',
  /** 用户信息 */
  USER_INFO = 'user:info',
  /** token黑名单 */
  TOKEN_BLACK_LIST = 'token:blacklist',
}
