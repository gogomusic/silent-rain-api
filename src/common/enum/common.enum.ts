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

export enum LoginType {
  /** 退出系统 */ LOGIN = 0,
  /** 登录系统 */ LOGOUT = 1,
}

export enum DeviceType {
  console = '游戏主机',
  desktop = '电脑',
  embedded = '嵌入式设备',
  mobile = '手机',
  smarttv = '智能电视',
  tablet = '平板电脑',
  wearable = '可穿戴设备',
  xr = '扩展现实设备',
}

export enum OperationResultEnum {
  /** 失败 */ FAIL = 0,
  /** 成功 */ SUCCESS = 1,
}
