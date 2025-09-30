import { HttpStatus } from '@nestjs/common';

export interface ResponseInterface<T = any> {
  readonly code: HttpStatus;
  readonly data?: T;
  readonly message: string;
  readonly timestamp: number;
  readonly success: boolean;
}
