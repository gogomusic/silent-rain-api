/* ================================= 公共枚举 ==================================== */

/** 用户类型 */
export enum UserType {
  /** 超级管理员 */ ADMIN_USER = 0,
  /** 普通用户 */ NORMAL_USER = 1,
}

/** 权限类型 */
export enum PermissionType {
  /** 菜单 */ MENU = 0,
  /** 按钮 */ BUTTON = 1,
}

export enum StatusEnum {
  /** 停用 */ DISABLED = 0,
  /** 启用 */ ENABLED = 1,
}
