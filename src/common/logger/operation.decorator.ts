import { SetMetadata } from '@nestjs/common';

export const OPERATION_MODULE = 'operation_module';
export const OPERATION_ACTION = 'operation_action';

export const LogModule = (module: string): ClassDecorator =>
  SetMetadata(OPERATION_MODULE, module);

export const LogAction = (action: string): MethodDecorator =>
  SetMetadata(OPERATION_ACTION, action);
