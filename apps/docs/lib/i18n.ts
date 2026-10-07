import { defineI18n } from 'fumadocs-core/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { testReportTranslations, zhCN } from 'fumadocs-test-reports/i18n';

export const i18n = defineI18n({ defaultLanguage: 'zh', languages: ['zh', 'en'] });
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(testReportTranslations())
  .preset('zh', zhCN())
  .add({
    en: { displayName: 'English' },
    zh: { displayName: '简体中文', 'Search(search trigger)': '搜索文档' },
  });

export function text(lang: string, zh: string, en: string) {
  return lang === 'zh' ? zh : en;
}
