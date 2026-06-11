import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { applyDecorators, Type } from '@nestjs/common';

type TModelType =
  | Type<any>
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

type PrimitiveName = 'string' | 'number' | 'boolean';

const PRIMITIVE_MAP: Record<string, PrimitiveName> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
};

function isPrimitive(
  model: TModelType,
): model is StringConstructor | NumberConstructor | BooleanConstructor {
  return model === String || model === Number || model === Boolean;
}

function getPrimitiveType(model: TModelType): PrimitiveName | null {
  return PRIMITIVE_MAP[model.name] ?? null;
}

function buildItemsSchema(model: TModelType) {
  const primitiveType = getPrimitiveType(model);
  return primitiveType
    ? { type: primitiveType }
    : { $ref: getSchemaPath(model) };
}

/**
 * 为接口响应生成通用的 Swagger 文档的装饰器。
 *
 * @template TModel 响应数据的模型类型
 * @param description 响应描述，默认为 'Success'
 * @param model 响应数据的模型类型（可选），支持原始类型（String、Number、Boolean）或自定义类
 * @param isList 返回分页列表结构 `{ list: T[], total: number }`（优先级高于 isArray）
 * @param isArray 返回纯数组结构 `T[]`
 * @returns 返回用于装饰控制器方法的装饰器，自动生成包含 ResponseDto 和指定数据模型的响应结构
 */
export function ApiResponse<TModel extends TModelType>(params?: {
  description?: string;
  model?: TModel;
  isList?: boolean;
  isArray?: boolean;
}) {
  const {
    description = 'Success',
    model,
    isList = false,
    isArray = false,
  } = params || {};

  // 无 model 时只返回 ResponseDto，data 可为 null
  if (!model) {
    return ApiOkResponse({
      description,
      example: { success: true },
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          { properties: { data: { nullable: true } } },
        ],
      },
    });
  }

  const isPrimitiveType = isPrimitive(model);
  const itemsSchema = buildItemsSchema(model);

  // 构建 data 字段的 schema
  let dataSchema: Record<string, any>;
  if (isList) {
    dataSchema = {
      type: 'object',
      properties: {
        list: { type: 'array', items: itemsSchema },
        total: { type: 'number', example: 100 },
      },
    };
  } else if (isArray) {
    dataSchema = { type: 'array', items: itemsSchema };
  } else if (isPrimitiveType) {
    dataSchema = { type: getPrimitiveType(model)! };
  } else {
    dataSchema = { $ref: getSchemaPath(model) };
  }

  const suffix = isArray ? 'Array' : '';
  const titleSuffix = isList ? 'List' : suffix;

  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        title: `ResponseOf${model.name}${titleSuffix}`,
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          { properties: { data: dataSchema } },
        ],
      },
    }),
  );
}
