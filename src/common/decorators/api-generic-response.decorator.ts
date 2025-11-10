import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';

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
export function ApiGenericResponse<TModel extends TModelType>(params?: {
  description?: string;
  model?: TModel;
  isList?: boolean;
  isArray?: boolean;
}) {
  const {
    description = '成功',
    model,
    isList = false,
    isArray = false,
  } = params || {};
  if (model) {
    let dataSchema;
    if (isArray) {
      let items = {};
      if (['String', 'Number', 'Boolean'].includes(model.name)) {
        items = {
          type: model.name.toLowerCase() as 'string' | 'number' | 'boolean',
        };
      } else {
        items = {
          $ref: getSchemaPath(model),
        };
      }
      dataSchema = {
        type: 'array' as const,
        items,
      };
    }
    // 针对原始类型处理
    else if (model === String) {
      dataSchema = { type: 'string' as const };
    } else if (model === Number) {
      dataSchema = { type: 'number' as const };
    } else if (model === Boolean) {
      dataSchema = { type: 'boolean' as const };
    } else {
      dataSchema = isList
        ? {
            type: 'object' as const,
            properties: {
              list: { type: 'array', items: { $ref: getSchemaPath(model) } },
              total: { type: 'number', example: 100 },
            },
          }
        : { $ref: getSchemaPath(model) };
    }
    return applyDecorators(
      ApiExtraModels(model),
      ApiOkResponse({
        description,
        schema: {
          title: `ResponseOf${model.name}${isArray ? 'Array' : ''}`,
          allOf: [
            {
              $ref: getSchemaPath(ResponseDto),
            },
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
    example: {
      code: HttpStatus.OK,
      success: true,
      msg: '成功',
      data: null,
    },
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ResponseDto),
        },
        {
          properties: {
            data: { nullable: true },
          },
        },
      ],
    },
  });
}
