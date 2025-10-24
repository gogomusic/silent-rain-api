import { HttpStatus } from '@nestjs/common';

export interface ResponseInterface<T = any> {
  readonly code: HttpStatus;
  readonly data?: T;
  readonly msg: string | string[];
  readonly success: boolean;
}
