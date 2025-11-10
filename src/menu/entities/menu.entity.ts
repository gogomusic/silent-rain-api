import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entity/time.entity';
import { MenuType, StatusEnum, YesOrNoEnum } from 'src/common/enum/common.enum';
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
  @Column({ type: 'varchar', comment: '菜单名称' })
  name: string;

  @ApiProperty({ description: '图标' })
  @Column({ type: 'varchar', comment: '图标', nullable: true })
  icon?: string;

  @ApiProperty({ description: '组件路径' })
  @Column({ type: 'varchar', comment: '组件路径', nullable: true })
  component?: string;

  @ApiProperty({ description: '路由地址' })
  @Column({ type: 'varchar', comment: '路由地址', nullable: true })
  path?: string;

  @ApiProperty({
    description: '（菜单）是否在导航中隐藏',
    enum: YesOrNoEnum,
    enumName: 'YesOrNoEnum',
  })
  @Column({
    type: 'tinyint',
    comment: '（菜单）是否在导航中隐藏',
    nullable: true,
  })
  is_hidden?: YesOrNoEnum;

  @ApiProperty({ description: '排序' })
  @Column({
    type: 'int',
    comment: '排序',
    default: 0,
  })
  sort: number;

  @ApiProperty({ description: '权限标识' })
  @Column({
    type: 'varchar',
    comment: '权限标识',
    nullable: true,
  })
  permission?: string;

  @ApiProperty({
    description: '状态',
    enum: StatusEnum,
    enumName: 'MenuStatusEnum',
  })
  @Column({
    type: 'tinyint',
    comment: '状态',
    default: 1,
  })
  status: StatusEnum;
}
