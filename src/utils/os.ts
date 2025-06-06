import * as os from 'os';

export function getServerIps(): string[] {
  const interfaces = os.networkInterfaces();
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
