import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { MenuType, StatusEnum, YesOrNoEnum } from 'src/common/enum/common.enum';

export class CreateMenuDto {
  @ApiProperty({ description: '上级菜单ID' })
  @IsInt()
  pid: number;

  @ApiProperty({
    description: '菜单类型 0:菜单 1:按钮',
    enum: MenuType,
    enumName: 'MenuType',
  })
  @IsEnum(MenuType)
  type: MenuType;

  @ApiProperty({ description: '菜单名称' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '图标', required: false })
  @IsOptional()
  icon: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  component?: string;

  @ApiProperty({ description: '路由地址', required: false })
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: '（菜单）是否在导航中隐藏',
    enum: YesOrNoEnum,
    enumName: 'YesOrNoEnum',
  })
  @IsOptional()
  @IsEnum(YesOrNoEnum)
  is_hidden?: YesOrNoEnum;

  @ApiProperty({
    description: '排序',
  })
  @IsInt()
  sort: number;

  @ApiProperty({
    description: '权限标识',
  })
  @IsOptional()
  permission?: string;

  @ApiProperty({
    description: '状态',
    default: 1,
    enum: StatusEnum,
    enumName: 'StatusEnum',
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
