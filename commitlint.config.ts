import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提交正文前必须空一行
    'body-leading-blank': [RuleConfigSeverity.Warning, 'always'],
    // 正文每行最大长度为100
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', 100],
    // footer前必须空一行
    'footer-leading-blank': [RuleConfigSeverity.Warning, 'always'],
    // footer每行最大长度为100
    'footer-max-line-length': [RuleConfigSeverity.Error, 'always', 100],
    // header最大长度为100
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
    // scope必须为小写
    'scope-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    // subject不能为句子首字母大写、每个单词首字母大写、PascalCase或全大写
    'subject-case': [
      RuleConfigSeverity.Error,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    // subject不能为空
    'subject-empty': [RuleConfigSeverity.Error, 'never'],
    // subject不能以句号结尾
    'subject-full-stop': [RuleConfigSeverity.Error, 'never', '.'],
    // type必须为小写
    'type-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    // type不能为空
    'type-empty': [RuleConfigSeverity.Error, 'never'],
    // type必须为以下枚举值之一
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        'build', // 影响构建系统或外部依赖项的更改（如：gulp、npm、webpack）
        'chore', // 其他不修改src或test的更改，如构建过程或辅助工具、更新依赖等
        'ci', // 与持续集成相关的更改（如：GitHub Actions、Travis等）
        'docs', // 只改动文档相关内容（如：README、API文档）
        'feat', // 新功能（feature）
        'fix', // 修复bug（bug fix）
        'perf', // 性能优化（performance improvement）
        'refactor', // 代码重构（不包括新增功能或修复bug）
        'revert', // 撤销提交（revert previous commit）
        'style', // 代码格式相关更改，不影响代码含义（如：空格、分号等）
        'test', // 添加或修改测试（如：单元测试、集成测试）
      ],
    ],
  },
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};

module.exports = Configuration;
