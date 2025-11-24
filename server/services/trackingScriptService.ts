import { escapeAttr } from '../utils/htmlUtils.js';

export interface GtmSnippets {
  gtmScript: string;
  gtmNoscript: string;
}

export function buildGtmSnippets(gtmId?: string): GtmSnippets {
  if (!gtmId) {
    return { gtmScript: '', gtmNoscript: '' };
  }

  const gtmScriptBody = [
    "(function(w,d,s,l,i){",
    "  w[l]=w[l]||[];",
    "  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});",
    '  var f=d.getElementsByTagName(s)[0],',
    '    j=d.createElement(s),',
    "    dl=l!='dataLayer'?'&l='+l:'';",
    '  j.async=true;',
    "  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;",
    '  f.parentNode.insertBefore(j,f);',
    `})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`,
  ].join('\n');
  const gtmScript = wrapInlineScript(gtmScriptBody);

  const gtmNoscript = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeAttr(
    gtmId,
  )}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

  return { gtmScript, gtmNoscript };
}

export function buildGaSnippet(gaId?: string) {
  if (!gaId) {
    return '';
  }

  const gtagBody = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    '',
    '// 設定預設的 consent mode（在載入 gtag.js 之前）',
    "gtag('consent', 'default', {",
    "  'analytics_storage': 'denied',",
    "  'ad_storage': 'denied',",
    "  'ad_user_data': 'denied',",
    "  'ad_personalization': 'denied',",
    "  'wait_for_update': 500",
    '});',
    '',
    '// 檢查是否有已儲存的同意設定',
    '(function() {',
    '  try {',
    "    const savedConsent = localStorage.getItem('ga_consent');",
    '    if (savedConsent) {',
    '      const consent = JSON.parse(savedConsent);',
    '      if (consent.preferences) {',
    "        gtag('consent', 'update', {",
    "          'analytics_storage': consent.preferences.analytics_storage || 'denied',",
    "          'ad_storage': consent.preferences.ad_storage || 'denied',",
    "          'ad_user_data': consent.preferences.ad_user_data || 'denied',",
    "          'ad_personalization': consent.preferences.ad_personalization || 'denied'",
    '        });',
    '      }',
    '    }',
    '  } catch (e) {',
    "    console.warn('Failed to load consent preferences:', e);",
    '  }',
    '})();',
    '',
    "gtag('js', new Date());",
    `gtag('config', ${JSON.stringify(gaId)});`,
  ].join('\n');

  const inlineScript = wrapInlineScript(gtagBody);
  const loaderScript = `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(
    gaId,
  )}"></script>`;

  return `${inlineScript}
${loaderScript}`;
}

function wrapInlineScript(body: string) {
  return `<script>
${body}
</script>`;
}
