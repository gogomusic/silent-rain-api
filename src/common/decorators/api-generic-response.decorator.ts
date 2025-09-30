import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { applyDecorators, Type } from '@nestjs/common';

type TModelType =
  | Type<any>
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

export function ApiGenericResponse<TModel extends TModelType>(
  description = '操作成功',
  model?: TModel,
) {
  if (model) {
    let dataSchema;
    // 针对原始类型处理
    if (model === String) {
      dataSchema = { type: 'string' };
    } else if (model === Number) {
      dataSchema = { type: 'number' };
    } else if (model === Boolean) {
      dataSchema = { type: 'boolean' };
    } else {
      dataSchema = { $ref: getSchemaPath(model) };
    }
    return applyDecorators(
      ApiExtraModels(ResponseDto, model),
      ApiOkResponse({
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(ResponseDto) },
            {
              properties: {
                data: dataSchema,
              },
            },
          ],
        },
      }),
    );
  }
  return ApiOkResponse({
    description,
    type: ResponseDto,
  });
}
