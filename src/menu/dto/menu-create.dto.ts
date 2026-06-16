import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { MenuType } from 'src/common/enums/common.enum';

export class MenuCreateDto {
  @ApiProperty({ description: '上级菜单ID' })
  @IsNotEmpty()
  @Type(() => Number)
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
  icon?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  component?: string;

  @ApiProperty({ description: '路由地址', required: false })
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: '权限标识',
    required: false,
  })
  @IsOptional()
  permission?: string;

  @ApiProperty({
    description: '（菜单）是否在导航中隐藏',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiProperty({
    description: '排序',
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  sort: number;

  @ApiProperty({
    description: '状态',
  })
  @IsBoolean()
  status: boolean;
}
