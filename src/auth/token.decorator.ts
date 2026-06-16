import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ALLOW_NO_PERMISSION = 'allowNoPermission';
export const AllowNoPermission = () => SetMetadata(ALLOW_NO_PERMISSION, true);
