import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { MenuType } from 'src/common/enums/common.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class Menu extends BasicEntity {
  @ApiProperty({ description: '上级菜单ID' })
  @Column({ type: 'int', comment: '上级菜单ID' })
  pid: number;

  @ApiProperty({
    description: '菜单类型 0:菜单 1:按钮',
    enum: MenuType,
    enumName: 'MenuType',
  })
  @Column({ type: 'int', comment: '菜单类型 0:菜单 1:按钮' })
  type: MenuType;

  @ApiProperty({ description: '菜单名称' })
  @Column({ length: 32, comment: '菜单名称' })
  name: string;

  @ApiProperty({ description: '图标' })
  @Column({ comment: '图标', nullable: true })
  icon?: string;

  @ApiProperty({ description: '组件路径', nullable: true })
  @Column({ comment: '组件路径', nullable: true })
  component?: string;

  @ApiProperty({ description: '路由地址', nullable: true })
  @Column({ comment: '路由地址', nullable: true })
  path?: string;

  @ApiProperty({ description: '权限标识', nullable: true })
  @Column({
    comment: '权限标识',
    nullable: true,
  })
  permission?: string;

  @ApiProperty({
    description: '（菜单）是否在导航中隐藏',
  })
  @Column({
    name: 'is_hidden',
    type: 'boolean',
    comment: '（菜单）是否在导航中隐藏',
    default: false,
  })
  isHidden: boolean;

  @ApiProperty({ description: '排序' })
  @Column({
    type: 'int',
    comment: '排序',
    default: 0,
  })
  sort: number;

  @ApiProperty({
    description: '状态',
  })
  @Column({
    type: 'boolean',
    comment: '状态',
    default: true,
  })
  status: boolean;
}
