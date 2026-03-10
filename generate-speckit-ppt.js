const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'GitHub Copilot';
pptx.company = 'Wanke';
pptx.subject = 'Spec Kit × GitHub Platform 深度集成方案';
pptx.title = 'Spec Kit × GitHub Platform 深度集成方案（双模式）';
pptx.lang = 'zh-CN';
pptx.theme = {
  headFontFace: 'PingFang SC',
  bodyFontFace: 'PingFang SC',
  lang: 'zh-CN'
};
pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM';

const C = {
  navy: '17324D',
  teal: '0E7490',
  aqua: '14B8A6',
  coral: 'E76F51',
  sand: 'F4F1EA',
  cream: 'FBFAF7',
  sage: 'D8E3DD',
  gold: 'E9C46A',
  ink: '1F2937',
  slate: '5B6B7A',
  white: 'FFFFFF',
  line: 'D7DEE5',
  mint: 'E7F7F5',
  blush: 'FCEEE9'
};

function addBg(slide, dark = false) {
  slide.background = { color: dark ? C.navy : C.cream };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.24, h: 7.5,
    line: { color: dark ? C.aqua : C.teal, transparency: 100 },
    fill: { color: dark ? C.aqua : C.teal }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.55, y: 0, w: 0.78, h: 7.5,
    line: { color: dark ? '214664' : 'E6ECEF', transparency: 100 },
    fill: { color: dark ? '214664' : 'E6ECEF', transparency: dark ? 25 : 0 }
  });
}

function addHeader(slide, title, subtitle, opts = {}) {
  const dark = !!opts.dark;
  addBg(slide, dark);
  slide.addText(title, {
    x: 0.7, y: 0.45, w: 9.6, h: 0.55,
    fontFace: 'PingFang SC', fontSize: dark ? 28 : 24, bold: true,
    color: dark ? C.white : C.ink, margin: 0
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.72, y: dark ? 1.15 : 0.95, w: 8.6, h: 0.42,
      fontFace: 'PingFang SC', fontSize: 11.5,
      color: dark ? 'DCE6F2' : C.slate, margin: 0
    });
  }
  if (!dark) {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.7, y: 1.32, w: 11.4, h: 0,
      line: { color: C.line, width: 1.2 }
    });
  }
}

function addFooter(slide, page, tag = 'Spec Kit × GitHub Platform') {
  slide.addText(tag, {
    x: 0.72, y: 7.02, w: 3.6, h: 0.22,
    fontFace: 'Aptos', fontSize: 9,
    color: C.slate, margin: 0
  });
  slide.addText(String(page), {
    x: 12.35, y: 6.98, w: 0.35, h: 0.24,
    fontFace: 'Aptos', fontSize: 9,
    color: C.slate, align: 'right', margin: 0
  });
}

function addPill(slide, text, x, y, color, textColor = C.white, w = 1.1) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34,
    rectRadius: 0.06,
    line: { color, transparency: 100 },
    fill: { color }
  });
  slide.addText(text, {
    x, y: y + 0.07, w, h: 0.16,
    fontFace: 'Aptos', fontSize: 9.5, bold: true,
    color: textColor, align: 'center', margin: 0
  });
}

function addCard(slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h,
    rectRadius: 0.08,
    line: { color: cfg.border || 'D7DEE5', width: 1 },
    fill: { color: cfg.fill || C.white },
    shadow: { type: 'outer', color: '9AA7B4', blur: 1, offset: 1, angle: 45, opacity: 0.12 }
  });
  if (cfg.band) {
    slide.addShape(pptx.ShapeType.rect, {
      x: cfg.x, y: cfg.y, w: 0.16, h: cfg.h,
      line: { color: cfg.band, transparency: 100 },
      fill: { color: cfg.band }
    });
  }
  if (cfg.title) {
    slide.addText(cfg.title, {
      x: cfg.x + 0.28, y: cfg.y + 0.18, w: cfg.w - 0.44, h: 0.28,
      fontFace: 'PingFang SC', fontSize: 15, bold: true,
      color: C.ink, margin: 0
    });
  }
  if (cfg.body) {
    slide.addText(cfg.body, {
      x: cfg.x + 0.28, y: cfg.y + 0.56, w: cfg.w - 0.42, h: cfg.h - 0.7,
      fontFace: 'PingFang SC', fontSize: 11.5,
      color: C.slate, breakLine: false, margin: 0.02,
      valign: 'top'
    });
  }
}

function addBulletList(slide, items, x, y, w, h, color = C.ink, fontSize = 14) {
  const runs = [];
  items.forEach((item, idx) => {
    runs.push({ text: item, options: { bullet: true, breakLine: idx !== items.length - 1 } });
  });
  slide.addText(runs, {
    x, y, w, h, fontFace: 'PingFang SC', fontSize, color,
    margin: 0.02, breakLine: false, paraSpaceAfterPt: 5
  });
}

function addStageRibbon(slide, stages, x, y, totalW) {
  const gap = 0.16;
  const w = (totalW - gap * (stages.length - 1)) / stages.length;
  stages.forEach((s, idx) => {
    const px = x + idx * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y, w, h: 0.62,
      rectRadius: 0.05,
      line: { color: s.color, width: 1 },
      fill: { color: s.fill || C.white }
    });
    slide.addText(s.label, {
      x: px, y: y + 0.12, w, h: 0.16,
      fontFace: 'Aptos', fontSize: 10, bold: true,
      color: s.color, align: 'center', margin: 0
    });
    slide.addText(s.text, {
      x: px + 0.08, y: y + 0.28, w: w - 0.16, h: 0.2,
      fontFace: 'PingFang SC', fontSize: 9.6,
      color: C.slate, align: 'center', margin: 0
    });
  });
}

function addSectionTitleCard(slide, label, title, body) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.72, y: 1.72, w: 5.35, h: 3.3,
    rectRadius: 0.08,
    line: { color: '325D7D', transparency: 100 },
    fill: { color: '234662', transparency: 6 }
  });
  addPill(slide, label, 0.92, 1.98, C.aqua, C.navy, 1.25);
  slide.addText(title, {
    x: 0.92, y: 2.45, w: 4.65, h: 1.2,
    fontFace: 'PingFang SC', fontSize: 28, bold: true,
    color: C.white, margin: 0
  });
  slide.addText(body, {
    x: 0.95, y: 3.78, w: 4.5, h: 0.8,
    fontFace: 'PingFang SC', fontSize: 13,
    color: 'D8E7F0', margin: 0.02
  });
}

// Slide 1
{
  const s = pptx.addSlide();
  addHeader(s, 'Spec Kit × GitHub Platform', '以 Spec-Driven Development 为主线，构建需求、设计、任务、实现与验证的闭环研发体系', { dark: true });
  addSectionTitleCard(s, '方案汇报', '深度集成设计方案', '双模式执行：IDE CLI + GitHub Custom Agent，统一产出到 Issues、Projects、Milestones 与 PR。');

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.55, y: 1.72, w: 5.85, h: 4.95,
    rectRadius: 0.08,
    line: { color: C.aqua, transparency: 100 },
    fill: { color: C.white, transparency: 5 }
  });

  const stats = [
    ['双模式执行', '本地与云端协同'],
    ['6 个 Agent', '覆盖 SDD 关键阶段'],
    ['统一产出层', 'Issues / Projects / PRs']
  ];
  stats.forEach((row, i) => {
    const y = 2.02 + i * 1.18;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y, w: 5.15, h: 0.9,
      rectRadius: 0.05,
      line: { color: i === 1 ? C.coral : C.aqua, width: 1 },
      fill: { color: i === 1 ? C.blush : 'EEF7F8' }
    });
    s.addText(row[0], {
      x: 7.18, y: y + 0.18, w: 1.6, h: 0.22,
      fontSize: 18, bold: true, color: C.navy, margin: 0
    });
    s.addText(row[1], {
      x: 8.82, y: y + 0.2, w: 2.7, h: 0.22,
      fontSize: 11.5, color: C.slate, margin: 0
    });
  });

  addPill(s, 'Draft v1.0', 0.72, 6.56, C.coral, C.white, 1.2);
  s.addText('2026-03-10', { x: 1.98, y: 6.62, w: 1.4, h: 0.18, fontSize: 10.5, color: 'DCE6F2', margin: 0 });
  addFooter(s, 1, '战略方案汇报');
}

// Slide 2
{
  const s = pptx.addSlide();
  addHeader(s, '背景与目标', '先回答为什么要做，以及这套方案最终要解决什么。');
  addPill(s, 'Why Now', 10.9, 0.48, C.coral, C.white, 1.35);

  addCard(s, {
    x: 0.78, y: 1.65, w: 4.05, h: 2.15, band: C.coral, fill: C.white,
    title: '当前痛点',
    body: '需求文档、Issue、任务拆解和实现 PR 之间缺乏统一链路。AI 能写代码，但缺少稳定、结构化、可追溯的输入。'
  });
  addBulletList(s, [
    '需求变化难同步到执行层',
    'Issue 与技术方案脱节',
    'AI 生成结果难以纳入标准流程'
  ], 0.98, 2.28, 3.55, 1.1, C.ink, 12);

  addCard(s, {
    x: 4.96, y: 1.65, w: 3.65, h: 2.15, band: C.teal,
    title: '方案目标',
    body: '把 Spec Kit 的规范化产物与 GitHub Platform 的协作对象打通，形成从需求到交付的闭环。'
  });
  addBulletList(s, [
    '统一 spec / plan / tasks / PR',
    '支持本地与云端两种执行方式',
    '让 Coding Agent 真正进入交付流程'
  ], 5.16, 2.28, 3.15, 1.08, C.ink, 12);

  addCard(s, {
    x: 8.78, y: 1.65, w: 3.75, h: 2.15, band: C.aqua,
    title: '成功标准',
    body: '团队可以用相同规则定义需求、拆解任务、指派 AI 执行，并在 GitHub 上追踪全过程。'
  });
  addBulletList(s, [
    'Feature 可追踪到 Epic / Story / Task',
    'Task 可直接指派给 Copilot',
    'PR 与验收标准一一对应'
  ], 8.98, 2.28, 3.25, 1.08, C.ink, 12);

  addStageRibbon(s, [
    { label: 'Spec Kit', text: '标准化产物', color: C.teal, fill: 'F0FAFA' },
    { label: 'GitHub', text: '统一协作对象', color: C.coral, fill: 'FFF4F0' },
    { label: 'Copilot', text: '进入执行链路', color: C.aqua, fill: 'EFFAF8' }
  ], 1.0, 4.58, 11.0);

  addCard(s, {
    x: 0.78, y: 5.48, w: 11.74, h: 1.06, band: C.navy, fill: 'F6F8FA',
    title: '核心判断',
    body: '不是再引入一个工具，而是把 Spec Kit 作为上游“规范生成器”，把 GitHub 作为下游“统一执行与协作平台”。'
  });
  addFooter(s, 2);
}

// Slide 3
{
  const s = pptx.addSlide();
  addHeader(s, '总体架构', '执行层、自动化层、统一产出层三层结构；路径 A / B / C 共用同一套映射规则。');
  addPill(s, 'Architecture', 10.55, 0.48, C.teal, C.white, 1.55);

  addCard(s, { x: 1.0, y: 1.7, w: 11.0, h: 1.02, band: C.navy, fill: 'EEF3F7', title: 'GitHub Platform 统一产出层', body: 'Issues（Epic / Story / Task）· Projects（状态与优先级）· Milestones（版本）· PRs（实现与评审）' });
  addCard(s, { x: 1.6, y: 3.05, w: 9.8, h: 0.92, band: C.coral, fill: 'FFF5F1', title: 'GitHub Actions 自动化编排层', body: 'specs/**/*.md 变更触发同步；task merge 后批量 assign Copilot；PR merge 后自动关闭任务。' });

  const boxes = [
    { x: 1.0, y: 4.45, w: 3.1, h: 1.8, title: '路径 A', body: 'IDE CLI\n/speckit.* 命令\n生成 specs/ 文件产物', band: C.teal, fill: 'F0FAFA' },
    { x: 5.08, y: 4.45, w: 3.1, h: 1.8, title: '路径 B', body: 'Custom Agent\nGitHub.com Agent Tab\n直接生成 spec / issue / PR', band: C.coral, fill: 'FFF5F1' },
    { x: 9.16, y: 4.45, w: 3.1, h: 1.8, title: '路径 C', body: 'Hybrid\nA 生成规范产物\nB 执行拆解与实现', band: C.aqua, fill: 'EFFAF8' }
  ];
  boxes.forEach((b) => addCard(s, b));

  [2.55, 6.63, 10.71].forEach((x) => {
    s.addShape(pptx.ShapeType.chevron, {
      x, y: 3.93, w: 0.36, h: 0.36,
      line: { color: C.gold, transparency: 100 },
      fill: { color: C.gold }
    });
  });

  addFooter(s, 3);
}

// Slide 4
{
  const s = pptx.addSlide();
  addHeader(s, '双模式执行路径', '路径 A 与路径 B 不互斥；路径 C 是推荐落地方式。');
  addPill(s, 'Execution Modes', 10.3, 0.48, C.coral, C.white, 2.0);

  addCard(s, { x: 0.85, y: 1.7, w: 3.85, h: 4.6, band: C.teal, fill: 'F0FAFA', title: '路径 A · IDE CLI 模式', body: '适合架构师与开发人员在本地反复推演。通过 /speckit.constitution / specify / plan / tasks / implement 生成规范产物，再同步到 GitHub。' });
  addBulletList(s, ['本地可控，适合深度设计', '依赖 CLI 与扩展能力', '更适合生成长期维护文档'], 1.08, 3.02, 3.32, 1.6, C.ink, 12);

  addCard(s, { x: 4.95, y: 1.7, w: 3.85, h: 4.6, band: C.coral, fill: 'FFF5F1', title: '路径 B · Custom Agent 模式', body: '适合产品经理、项目经理及分布式团队直接在 GitHub.com 上发起需求、拆解任务并让 Coding Agent 执行。' });
  addBulletList(s, ['无需本地环境，门槛更低', '更贴近 Issue / PR 协作', '更容易被非研发角色使用'], 5.18, 3.02, 3.32, 1.6, C.ink, 12);

  addCard(s, { x: 9.05, y: 1.7, w: 3.35, h: 4.6, band: C.aqua, fill: 'EFFAF8', title: '路径 C · Hybrid', body: '把高思考密度活动放在本地，把高协作密度活动放在 GitHub。共享统一映射规则与同一套产物格式。' });
  addBulletList(s, ['Constitution / Plan 偏本地', 'Specify / Tasks / Implement 偏云端', '交付效率与治理能力兼得'], 9.28, 3.02, 2.82, 1.6, C.ink, 12);

  addFooter(s, 4);
}

// Slide 5
{
  const s = pptx.addSlide();
  addHeader(s, '推荐的混合模式', '不是二选一，而是把不同角色放到最适合的工作位置。');
  addPill(s, 'Best Practice', 10.45, 0.48, C.aqua, C.navy, 1.75);

  const stages = [
    ['Constitution', '架构师', 'A'],
    ['Specify', '产品经理', 'B'],
    ['Clarify', '产品经理 / 架构师', 'B'],
    ['Plan', '架构师', 'A 或 B'],
    ['Tasks', '项目经理 / 架构师', 'B'],
    ['Implement', '开发 + Copilot', 'B'],
    ['Verify', '产品 / 架构 / 开发', 'B']
  ];
  stages.forEach((row, i) => {
    const x = 0.85 + i * 1.73;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.0, w: 1.46, h: 2.45,
      rectRadius: 0.05,
      line: { color: row[2] === 'A' ? C.teal : row[2] === 'B' ? C.coral : C.aqua, width: 1 },
      fill: { color: row[2] === 'A' ? 'F0FAFA' : row[2] === 'B' ? 'FFF5F1' : 'EFFAF8' }
    });
    s.addText(row[0], { x: x + 0.08, y: 2.22, w: 1.3, h: 0.38, align: 'center', fontSize: 12.5, bold: true, color: C.ink, margin: 0 });
    s.addText(row[1], { x: x + 0.08, y: 2.9, w: 1.3, h: 0.5, align: 'center', fontSize: 10.5, color: C.slate, margin: 0 });
    addPill(s, row[2], x + 0.34, 3.82, row[2] === 'A' ? C.teal : row[2] === 'B' ? C.coral : C.aqua, row[2] === 'A 或 B' ? C.navy : C.white, 0.78);
  });

  s.addShape(pptx.ShapeType.line, { x: 1.08, y: 4.96, w: 10.62, h: 0, line: { color: C.gold, width: 2.2 } });
  for (let i = 0; i < 6; i += 1) {
    s.addShape(pptx.ShapeType.chevron, { x: 2.38 + i * 1.73, y: 4.79, w: 0.28, h: 0.34, line: { color: C.gold, transparency: 100 }, fill: { color: C.gold } });
  }

  addCard(s, { x: 1.05, y: 5.35, w: 11.1, h: 0.92, band: C.navy, fill: 'F6F8FA', title: '推荐原因', body: '把“高治理、高结构化”的活动前置到 Spec / Plan，把“高协作、高并行”的活动后置到 Issue / Task / PR，形成清晰的人机协作分层。' });
  addFooter(s, 5);
}

// Slide 6
{
  const s = pptx.addSlide();
  addHeader(s, '团队角色与职责分工', '用角色定义保障方案可落地，而不是只有工具没有责任边界。');
  addPill(s, 'Team Model', 10.75, 0.48, C.teal, C.white, 1.45);

  const roles = [
    { x: 0.86, y: 1.72, w: 2.85, h: 2.22, color: C.coral, title: '产品经理', body: '需求定义、验收标准、优先级排序、需求澄清、验收确认' },
    { x: 3.95, y: 1.72, w: 2.85, h: 2.22, color: C.teal, title: '项目经理', body: '流程编排、Milestone 管理、Issue 调度、进度与风险控制' },
    { x: 7.04, y: 1.72, w: 2.85, h: 2.22, color: C.aqua, title: '架构师', body: 'constitution、plan、data model、contracts、关键 PR 评审' },
    { x: 10.13, y: 1.72, w: 2.35, h: 2.22, color: C.navy, title: '开发人员', body: '任务实现、测试编写、PR 提交、Review 与本地验证' }
  ];
  roles.forEach((r) => addCard(s, { x: r.x, y: r.y, w: r.w, h: r.h, band: r.color, fill: 'FFFFFF', title: r.title, body: r.body }));

  s.addTable([
    [
      { text: '角色', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '主要路径', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '关键产出物', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } }
    ],
    ['产品经理', '路径 B（GitHub.com）', 'spec.md、Epic/Story Issues'],
    ['项目经理', 'Projects + Actions', 'Milestone、Board、进度看板'],
    ['架构师', '路径 A 或 B', 'constitution.md、plan.md、contracts/'],
    ['开发人员', '路径 A + 路径 B', '代码 PR、测试、Issue 更新']
  ], {
    x: 0.96, y: 4.42, w: 11.4, h: 1.86,
    colW: [1.8, 3.0, 6.6], rowH: [0.38, 0.36, 0.36, 0.36, 0.36],
    border: { pt: 1, color: C.line },
    fontFace: 'PingFang SC', fontSize: 11, color: C.ink,
    fill: { color: C.white }, margin: 0.04,
    valign: 'middle'
  });
  addFooter(s, 6);
}

// Slide 7
{
  const s = pptx.addSlide();
  addHeader(s, '角色 × SDD 阶段职责矩阵', '用 RACI 明确谁负责执行、谁审批、谁咨询、谁被知会。');
  addPill(s, 'RACI', 11.3, 0.48, C.coral, C.white, 0.95);

  s.addTable([
    [
      { text: '阶段', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '产品经理', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '项目经理', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '架构师', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '开发人员', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } }
    ],
    ['Constitution', 'C', 'I', 'R', 'I'],
    ['Specify', 'R', 'I', 'C', 'I'],
    ['Clarify', 'R', 'C', 'C', 'C'],
    ['Plan', 'C', 'I', 'R', 'C'],
    ['Analyze', 'A', 'I', 'R', 'I'],
    ['Tasks', 'C', 'A', 'R', 'C'],
    ['Implement', 'I', 'C', 'C', 'R'],
    ['Verify', 'A', 'I', 'A', 'R']
  ], {
    x: 0.9, y: 1.75, w: 8.0, h: 4.7,
    colW: [1.7, 1.55, 1.55, 1.55, 1.55],
    rowH: [0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
    border: { pt: 1, color: C.line },
    fontFace: 'Aptos', fontSize: 12, color: C.ink,
    fill: { color: C.white }, margin: 0.03, align: 'center', valign: 'middle'
  });

  addCard(s, { x: 9.25, y: 1.82, w: 3.0, h: 1.3, band: C.teal, fill: 'F0FAFA', title: 'R / A / C / I 解释', body: 'R = Responsible 执行\nA = Accountable 审批\nC = Consulted 咨询\nI = Informed 知会' });
  addCard(s, { x: 9.25, y: 3.36, w: 3.0, h: 1.2, band: C.coral, fill: 'FFF5F1', title: '管理含义', body: '需求由产品负责，方案由架构负责，执行由开发负责，节奏由项目经理推动。' });
  addCard(s, { x: 9.25, y: 4.8, w: 3.0, h: 1.2, band: C.aqua, fill: 'EFFAF8', title: '落地建议', body: '把角色映射到 Agent 和 GitHub 权限，避免“人人都能做，最终没人负责”。' });
  addFooter(s, 7);
}

// Slide 8
{
  const s = pptx.addSlide();
  addHeader(s, '核心 Agent 设计（上游）', '前 3 个 Agent 负责把模糊需求转成结构化规范与技术方案。');
  addPill(s, 'Agents 1/2', 10.7, 0.48, C.aqua, C.navy, 1.4);

  addCard(s, { x: 0.88, y: 1.72, w: 3.8, h: 4.75, band: C.teal, fill: 'F0FAFA', title: 'speckit-constitution', body: '角色：项目原则制定者\n输入：现有代码库与团队约束\n输出：constitution.md + copilot-instructions.md\n价值：为后续所有 Agent 提供统一治理边界。' });
  addBulletList(s, ['定义编码、测试、架构准则', '沉淀为仓库可执行规则', '控制 AI 生成的边界'], 1.12, 4.22, 3.25, 1.5, C.ink, 12);

  addCard(s, { x: 4.78, y: 1.72, w: 3.8, h: 4.75, band: C.coral, fill: 'FFF5F1', title: 'speckit-specify', body: '角色：需求规格生成器\n输入：自然语言需求\n输出：spec.md + Epic Issue + Story Issues\n价值：把产品语言转成标准化需求对象。' });
  addBulletList(s, ['自动识别用户故事', '生成验收标准与 clarifications', '直接落地到 GitHub Issues'], 5.02, 4.22, 3.25, 1.5, C.ink, 12);

  addCard(s, { x: 8.68, y: 1.72, w: 3.8, h: 4.75, band: C.aqua, fill: 'EFFAF8', title: 'speckit-plan', body: '角色：技术方案规划师\n输入：spec.md + constitution.md\n输出：plan.md、data-model.md、contracts/\n价值：把业务需求翻译成可实现的技术结构。' });
  addBulletList(s, ['输出技术决策和约束', '创建 Milestone 与 Project 信息', '为任务拆解和实现提供上下文'], 8.92, 4.22, 3.25, 1.5, C.ink, 12);
  addFooter(s, 8);
}

// Slide 9
{
  const s = pptx.addSlide();
  addHeader(s, '核心 Agent 设计（下游）', '后 3 个 Agent 负责把技术方案变成可执行任务，并驱动 Coding Agent 进入交付。');
  addPill(s, 'Agents 2/2', 10.7, 0.48, C.coral, C.white, 1.4);

  addCard(s, { x: 0.88, y: 1.72, w: 3.8, h: 4.75, band: C.aqua, fill: 'EFFAF8', title: 'speckit-tasks', body: '角色：任务拆解器\n输入：plan.md + contracts + data-model\n输出：tasks.md + Task Issues\n价值：把方案切成可并行、可追踪、可指派的工作单元。' });
  addBulletList(s, ['识别依赖与并行标记', '生成 copilot-eligible 标签', '在 Issue body 中注入实现上下文'], 1.12, 4.22, 3.25, 1.5, C.ink, 12);

  addCard(s, { x: 4.78, y: 1.72, w: 3.8, h: 4.75, band: C.navy, fill: 'EEF3F7', title: 'speckit-implement', body: '角色：实现执行器\n输入：tasks.md + spec / plan / constitution\n输出：代码 PR + 测试 + Issue 状态更新\n价值：让 Coding Agent 成为标准交付链路的一部分。' });
  addBulletList(s, ['按照任务顺序执行实现', '自动更新 Task Issue 状态', '围绕验收标准生成代码与测试'], 5.02, 4.22, 3.25, 1.5, C.ink, 12);

  addCard(s, { x: 8.68, y: 1.72, w: 3.8, h: 4.75, band: C.coral, fill: 'FFF5F1', title: 'speckit-orchestrator', body: '角色：流程编排器\n输入：需求描述或阶段入口\n输出：串联各 Agent 的执行路径\n价值：统一启动完整 SDD 流程。' });
  addBulletList(s, ['适合阶段编排和门控', 'GitHub.com 当前需人工分步执行', '成熟后可叠加 Actions 调度'], 8.92, 4.22, 3.25, 1.5, C.ink, 12);
  addFooter(s, 9);
}

// Slide 10
{
  const s = pptx.addSlide();
  addHeader(s, 'GitHub 对象映射规则', '方案价值不在于多写文档，而在于每份产物都能落到 GitHub 的一个可执行对象。');
  addPill(s, 'Mapping', 10.95, 0.48, C.teal, C.white, 1.2);

  s.addTable([
    [
      { text: 'Spec / Tasks 元素', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: 'GitHub 实体', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } },
      { text: '落地规则', options: { fill: { color: C.navy }, color: C.white, bold: true, align: 'center' } }
    ],
    ['Feature Title', 'Epic Issue', '[Spec] Feature NNN: <name>'],
    ['User Stories', 'Story Issues', '每个 “As a...” 一个 Issue'],
    ['Acceptance Criteria', 'Issue Task List', '转换为 - [ ] checklist'],
    ['[NEEDS CLARIFICATION]', 'Clarification Issue', '打 needs-clarification label'],
    ['tasks.md Task', 'Task Issue', '每条任务一个 Issue'],
    ['[P] 并行标记', 'Label', '打 parallel-ready label'],
    ['Phase 分组', 'Label / Project 字段', 'phase-N / SDD Phase'],
    ['plan.md', 'Milestone / Project', '版本、阶段、技术摘要']
  ], {
    x: 0.8, y: 1.76, w: 12.0, h: 3.98,
    colW: [2.7, 2.45, 6.85],
    rowH: [0.4, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
    border: { pt: 1, color: C.line },
    fontFace: 'PingFang SC', fontSize: 11, color: C.ink,
    fill: { color: C.white }, margin: 0.04, valign: 'middle'
  });

  addCard(s, { x: 0.95, y: 6.0, w: 5.7, h: 0.86, band: C.coral, fill: 'FFF5F1', title: '关键幂等策略', body: '在 Issue body 中写入 <!-- spec-kit:feature-NNN:task-M --> 元数据，避免多次同步重复创建对象。' });
  addCard(s, { x: 6.88, y: 6.0, w: 5.35, h: 0.86, band: C.aqua, fill: 'EFFAF8', title: '对 Coding Agent 的价值', body: '每个 Task Issue 都天然携带 spec / plan / contracts / data model 上下文，提升生成质量。' });
  addFooter(s, 10);
}

// Slide 11
{
  const s = pptx.addSlide();
  addHeader(s, '端到端工作流示例', '以一个需求从提出到交付的完整过程，说明人、Agent、GitHub 三者如何协作。');
  addPill(s, 'Workflow', 10.9, 0.48, C.aqua, C.navy, 1.25);

  const flow = [
    { x: 0.82, color: C.coral, title: '1. 需求输入', body: 'PM 在 Agent Tab 选择 speckit-specify，输入业务需求。' },
    { x: 2.63, color: C.teal, title: '2. 生成 spec', body: '输出 spec.md + Epic / Story Issues，发起 PR。' },
    { x: 4.44, color: C.aqua, title: '3. 方案设计', body: '架构师运行 speckit-plan，补齐 plan / model / contracts。' },
    { x: 6.25, color: C.navy, title: '4. 任务拆解', body: 'speckit-tasks 生成 tasks.md 并批量创建 Task Issues。' },
    { x: 8.06, color: C.coral, title: '5. 指派实现', body: '项目经理把 copilot-eligible 任务 assign 给 Copilot。' },
    { x: 9.87, color: C.teal, title: '6. 自动 PR', body: 'speckit-implement 执行实现，生成代码和测试 PR。' },
    { x: 11.68, color: C.aqua, title: '7. 验收关闭', body: '产品 / 架构 / 开发 Review，Merge 后自动关闭任务。' }
  ];

  flow.forEach((f, idx) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: f.x, y: 2.15, w: 1.35, h: 3.05,
      rectRadius: 0.05,
      line: { color: f.color, width: 1 },
      fill: { color: 'FFFFFF' }
    });
    s.addShape(pptx.ShapeType.rect, {
      x: f.x, y: 2.15, w: 1.35, h: 0.22,
      line: { color: f.color, transparency: 100 },
      fill: { color: f.color }
    });
    s.addText(f.title, { x: f.x + 0.08, y: 2.42, w: 1.18, h: 0.65, fontSize: 10.8, bold: true, color: C.ink, align: 'center', margin: 0 });
    s.addText(f.body, { x: f.x + 0.1, y: 3.22, w: 1.12, h: 1.4, fontSize: 9.5, color: C.slate, align: 'left', margin: 0.02 });
    if (idx < flow.length - 1) {
      s.addShape(pptx.ShapeType.chevron, { x: f.x + 1.45, y: 3.48, w: 0.24, h: 0.28, line: { color: C.gold, transparency: 100 }, fill: { color: C.gold } });
    }
  });

  addCard(s, { x: 1.0, y: 5.72, w: 11.2, h: 0.78, band: C.navy, fill: 'F6F8FA', title: '核心闭环', body: '需求不是在文档里结束，而是在 Issue / Task / PR 链路中被逐步验证，最终由验收标准回收。' });
  addFooter(s, 11);
}

// Slide 12
{
  const s = pptx.addSlide();
  addHeader(s, '实施路线图', '分五个阶段推进，优先实现成本更低、价值更高的路径 B。');
  addPill(s, 'Roadmap', 10.85, 0.48, C.coral, C.white, 1.25);

  const phases = [
    { y: 1.7, w: 2.15, color: C.coral, title: 'Phase 1', sub: 'Custom Agent 定义', body: '定义 6 个 .agent.md，完成核心 prompt。' },
    { y: 2.55, w: 3.05, color: C.teal, title: 'Phase 2', sub: 'Spec Kit Extension', body: '实现 /speckit.gh-sync 与 spec → GitHub 同步。' },
    { y: 3.4, w: 2.8, color: C.aqua, title: 'Phase 3', sub: 'Actions 自动化', body: 'spec 变更同步、Task 自动 assign、PR 自动关单。' },
    { y: 4.25, w: 2.55, color: C.navy, title: 'Phase 4', sub: 'Projects 模板', body: '构建 Board / Table 视图与字段规范。' },
    { y: 5.1, w: 2.95, color: C.gold, title: 'Phase 5', sub: '验证与推广', body: '试点、幂等验证、文档沉淀与复制推广。' }
  ];
  let startX = 1.0;
  phases.forEach((p, idx) => {
    addCard(s, { x: startX, y: p.y, w: p.w, h: 0.66, band: p.color, fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFB', title: `${p.title}  ${p.sub}`, body: '' });
    s.addText(p.body, { x: startX + 0.28, y: p.y + 0.34, w: p.w - 0.36, h: 0.18, fontSize: 9.8, color: C.slate, margin: 0 });
    startX += 1.8;
  });

  s.addShape(pptx.ShapeType.line, { x: 1.02, y: 6.22, w: 10.95, h: 0, line: { color: C.line, width: 2.2 } });
  [1.3, 3.4, 5.5, 7.6, 9.7].forEach((x, idx) => {
    s.addShape(pptx.ShapeType.ellipse, { x, y: 6.0, w: 0.42, h: 0.42, line: { color: phases[idx].color, width: 1 }, fill: { color: phases[idx].color } });
    s.addText(String(idx + 1), { x: x + 0.105, y: 6.1, w: 0.2, h: 0.12, fontSize: 9, bold: true, color: idx === 4 ? C.ink : C.white, align: 'center', margin: 0 });
  });

  addCard(s, { x: 9.72, y: 1.52, w: 2.46, h: 1.8, band: C.coral, fill: 'FFF5F1', title: '优先级建议', body: '先做路径 B：仅需 .agent.md + prompt 工程即可验证核心价值；路径 A 与 Actions 作为增量增强。' });
  addFooter(s, 12);
}

// Slide 13
{
  const s = pptx.addSlide();
  addHeader(s, '验证方案与关键风险', '要同时证明“能跑通”和“可持续”，验证与风险要一起设计。');
  addPill(s, 'Validation', 10.75, 0.48, C.teal, C.white, 1.45);

  addCard(s, { x: 0.86, y: 1.72, w: 5.75, h: 4.85, band: C.aqua, fill: 'EFFAF8', title: '验证方案', body: '建议在测试仓库按最短路径完成 4 类验证：\n\n1) Custom Agent 验证：specify / plan / tasks / implement 依次跑通\n2) CLI 同步验证：/speckit.gh-sync 正确创建或更新对象\n3) 幂等验证：多次同步不重复创建 Issue\n4) 混合模式验证：A 生成 spec，B 读取并创建 tasks 与 PR' });

  addCard(s, { x: 6.88, y: 1.72, w: 5.6, h: 4.85, band: C.coral, fill: 'FFF5F1', title: '关键风险与限制', body: '1) GitHub.com 当前不完整支持 Agent handoffs\n2) github/* 写权限依赖仓库配置\n3) 双向同步先不做，避免复杂度过早上升\n4) 跨仓库协同与 Packages/Releases 暂不纳入一期范围' });

  addCard(s, { x: 1.05, y: 5.9, w: 11.1, h: 0.7, band: C.navy, fill: 'F6F8FA', title: '判断标准', body: '试点成功的标志不是“生成了文档”，而是“一个 Feature 可以从 spec 一路追踪到 Task 和 PR，并被团队稳定复用”。' });
  addFooter(s, 13);
}

// Slide 14
{
  const s = pptx.addSlide();
  addHeader(s, '预期收益与下一步', '从规范、协作、自动化三个维度收口，并形成清晰的决策建议。', { dark: true });
  addPill(s, 'Decision', 11.0, 0.5, C.coral, C.white, 1.2);

  addCard(s, { x: 0.88, y: 1.75, w: 3.7, h: 3.8, band: C.aqua, fill: C.white, title: '预期收益', body: '1. 需求到交付链路标准化\n2. AI 生成更可控、更可审计\n3. 项目透明度显著提升\n4. 任务拆解与执行自动化增强\n5. 团队协作成本下降' });
  addCard(s, { x: 4.85, y: 1.75, w: 3.7, h: 3.8, band: C.teal, fill: C.white, title: '建议决策', body: '1. 先在单一试点仓库实现路径 B\n2. 优先落地 specify / plan / tasks / implement 四个核心 Agent\n3. 路径 A 与 Actions 自动化作为二期增强' });
  addCard(s, { x: 8.82, y: 1.75, w: 3.7, h: 3.8, band: C.coral, fill: C.white, title: '下一步动作', body: '1. 选定试点仓库与责任人\n2. 编写 .github/agents/*.agent.md\n3. 建立测试 Project Board\n4. 运行端到端演练并沉淀操作手册' });

  s.addText('结论：推荐以“路径 B 先行、路径 C 收口、路径 A 增强”的策略推进。', {
    x: 1.0, y: 6.03, w: 11.1, h: 0.42,
    fontFace: 'PingFang SC', fontSize: 18, bold: true,
    color: C.white, align: 'center', margin: 0
  });
  addFooter(s, 14, '建议启动试点');
}

pptx.writeFile({ fileName: '/Users/qifenghou/Codes/Wanke/SpecKit-GitHub-Platform-Design-Deck.pptx' });
