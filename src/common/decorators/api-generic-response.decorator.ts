import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { applyDecorators, Type } from '@nestjs/common';

type TModelType =
  | Type<any>
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

/**
 * 为接口响应生成通用的 Swagger 文档的装饰器。
 *
 * @template TModel 响应数据的模型类型
 * @param description 响应描述，默认为 'success'
 * @param model 响应数据的模型类型（可选），支持原始类型（String、Number、Boolean）或自定义类
 * @returns 返回用于装饰控制器方法的装饰器，自动生成包含 ResponseDto 和指定数据模型的响应结构
 *
 * - 如果指定了 model，会根据类型生成对应的 schema，并将其作为 data 字段嵌入 ResponseDto。
 * - 如果未指定 model，则直接使用 ResponseDto 作为响应类型。
 */
export function ApiGenericResponse<TModel extends TModelType>(
  description = 'success',
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
