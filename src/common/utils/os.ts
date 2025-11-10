import { networkInterfaces } from 'os';

/**
 * 获取服务器的IP地址
 * @returns {string[]} 服务器的IP地址列表
 */
export function getServerIps(): string[] {
  const interfaces = networkInterfaces();
  const ips: string[] = [];
  for (const interfaceName of Object.keys(interfaces)) {
    for (const interfaceInfo of interfaces[interfaceName] || []) {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        ips.push(interfaceInfo.address);
      }
    }
  }
  return ips;
}
