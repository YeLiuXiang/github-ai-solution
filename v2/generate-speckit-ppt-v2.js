const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.author = 'GitHub Copilot';
pptx.company = 'Wanke';
pptx.subject = 'Spec Kit × GitHub Platform 深度集成方案';
pptx.title = 'Spec Kit × GitHub Platform 深度集成方案（双模式）';
pptx.lang = 'zh-CN';
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
// ...existing code...
