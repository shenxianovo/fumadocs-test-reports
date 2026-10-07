import type { TranslationExtension, TranslationPreset } from 'fumadocs-core/i18n';

const translations = {
  'Tests(test reports)': '测试总数',
  'Passed(test reports)': '通过',
  'Unsuccessful(test reports)': '未成功',
  'Run duration(test reports)': '运行总耗时',
  'Test results(test reports)': '测试结果',
  'Search tests or groups(test reports)': '搜索测试名称或分组',
  'All(test reports)': '全部',
  'Expand all(test reports)': '展开全部',
  'Collapse all(test reports)': '折叠全部',
  'No matching test results.(test reports)': '没有符合条件的测试结果。',
  'Details(test reports)': '详情',
  'Output(test reports)': '输出',
  'Attempts(test reports)': '执行尝试',
  'Traces(test reports)': '追踪',
  'No output recorded.(test reports)': '未记录输出。',
  'Unknown(test reports)': '未知',
  'Source outcome(test reports)': '原始状态',
  'Instrumentation source(test reports)': '追踪来源',
  'Source location(test reports)': '源码位置',
  'Start(test reports)': '开始时间',
  'End(test reports)': '结束时间',
  'Retries(test reports)': '重试次数',
  'Passed on retry(test reports)': '重试后通过',
  'Standard output(test reports)': '标准输出',
  'Standard error(test reports)': '错误输出',
  'Skip reason(test reports)': '跳过原因',
  'Categories(test reports)': '分类',
  'Properties(test reports)': '属性',
  'No test results recorded.(test reports)': '未记录测试结果。',
  'Read report(test reports)': '查看报告',
  'Error(test reports)': '错误',
  'Test files(test reports)': '测试文件',
  'File(test reports)': '文件',
  'Full name(test reports)': '完整名称',
  'Metadata(test reports)': '元数据',
  'Tags(test reports)': '标签',
  'Failed tests(test reports)': '失败测试',
  'File error(test reports)': '文件错误',
  'Trace ID(test reports)': '追踪 ID',
  'Span ID(test reports)': 'Span ID',
  'Parent ID(test reports)': '父 Span ID',
  'Kind(test reports)': '种类',
  'Status(test reports)': '状态',
  'Events(test reports)': '事件',
  'Links(test reports)': '关联',
  'Failed(test reports)': '失败',
  'Skipped(test reports)': '跳过',
  'Cancelled(test reports)': '取消',
  'Timed out(test reports)': '超时',
  'Running(test reports)': '执行中',
  'Pending(test reports)': '待执行',
  'Todo(test reports)': '待实现',
  'Disabled(test reports)': '禁用',
};

export type TestReportTranslationKey = keyof typeof translations;

/** Register report labels with the host's Fumadocs translation system. */
export function testReportTranslations(): TranslationExtension<TestReportTranslationKey> {
  return { keys: Object.keys(translations) as TestReportTranslationKey[] };
}

/** Simplified Chinese UI labels; the host maps this preset to its own locale code. */
export function zhCN(): TranslationPreset<TestReportTranslationKey> {
  return { name: 'zh-CN', value: translations };
}
