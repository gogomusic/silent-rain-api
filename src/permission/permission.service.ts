import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(private readonly dataSource: DataSource) {}

  async findUserApis(user_id: number): Promise<string[]> {
    const permsResult = await this.dataSource
      .createQueryBuilder()
      .select(['p.code'])
      .from('user_role', 'ur')
      .leftJoin('role_permission', 'rp', 'ur.role_id = rp.role_id')
      .leftJoin('permission', 'p', 'rp.permission_id = p.id')
      .where('ur.user_id = :user_id', { user_id })
      .getRawMany();
    const perms = new Set(
      permsResult
        .map((item: { p_code: string }) => item.p_code)
        .filter((i) => i),
    );
    return Array.from(perms);
  }
}
