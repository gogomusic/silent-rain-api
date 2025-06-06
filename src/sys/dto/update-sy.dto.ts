import { PartialType } from '@nestjs/mapped-types';
import { CreateSyDto } from './create-sy.dto';

export class UpdateSyDto extends PartialType(CreateSyDto) {}
