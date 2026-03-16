const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.author = 'GitHub Copilot';
pptx.company = 'Wanke';
pptx.subject = 'Spec-Driven Development × GitHub Platform 深度集成方案';
pptx.title = 'Spec-Driven Development × GitHub Platform 深度集成方案（v3）';
pptx.lang = 'zh-CN';
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';

// ── Color Palette ──────────────────────────────────────────────
const C = {
  navy:   '17324D',
  teal:   '0E7490',
  aqua:   '14B8A6',
  coral:  'E76F51',
  sand:   'F4F1EA',
  cream:  'FBFAF7',
  gold:   'E9C46A',
  ink:    '1F2937',
  slate:  '64748B',
  white:  'FFFFFF',
  line:   'D7DEE5',
  lightTeal: 'F0FAFA',
  lightCoral: 'FFF5F1',
  lightAqua: 'EFFAF8',
  lightNavy: 'EEF3F7',
  bg:     'F8F9FB',
};

// ── Fonts ──────────────────────────────────────────────────────
const TITLE_FONT = 'Microsoft YaHei';
const BODY_FONT  = 'Microsoft YaHei';
const MONO_FONT  = 'Consolas';

// ── Slide margins ──────────────────────────────────────────────
const ML = 0.7;   // left margin
const MR = 0.7;   // right margin
const CONTENT_W = 13.333 - ML - MR; // ~11.93

// ── Helper: dark or light slide background ─────────────────────
function setupSlide(slide, dark) {
  slide.background = { color: dark ? C.navy : C.bg };
}

// ── Helper: slide header ───────────────────────────────────────
function addHeader(slide, title, subtitle, dark) {
  setupSlide(slide, dark);
  // Left accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.12, h: 7.5,
    fill: { color: dark ? C.aqua : C.teal },
  });
  slide.addText(title, {
    x: ML, y: 0.4, w: 9.5, h: 0.6,
    fontFace: TITLE_FONT, fontSize: dark ? 28 : 26, bold: true,
    color: dark ? C.white : C.ink, margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: ML, y: dark ? 1.1 : 1.05, w: 10, h: 0.4,
      fontFace: BODY_FONT, fontSize: 12,
      color: dark ? 'B0C4DE' : C.slate, margin: 0,
    });
  }
  if (!dark) {
    slide.addShape(pptx.ShapeType.line, {
      x: ML, y: 1.45, w: CONTENT_W, h: 0,
      line: { color: C.line, width: 1 },
    });
  }
}

// ── Helper: footer ─────────────────────────────────────────────
function addFooter(slide, page, tag, dark) {
  tag = tag || 'SDD × GitHub Platform';
  const footerColor = dark ? 'B0C9DA' : C.slate;
  slide.addText(tag, {
    x: ML, y: 7.08, w: 4, h: 0.2,
    fontFace: BODY_FONT, fontSize: 8, color: footerColor, margin: 0,
  });
  slide.addText(String(page), {
    x: 12.2, y: 7.08, w: 0.5, h: 0.2,
    fontFace: BODY_FONT, fontSize: 8, color: footerColor, align: 'right', margin: 0,
  });
}

// ── Helper: pill tag ───────────────────────────────────────────
function addPill(slide, text, x, y, bgColor, txtColor, w) {
  w = w || 1.2;
  txtColor = txtColor || C.white;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.28,
    rectRadius: 0.14,
    fill: { color: bgColor },
  });
  slide.addText(text, {
    x, y, w, h: 0.28,
    fontFace: BODY_FONT, fontSize: 9, bold: true,
    color: txtColor, align: 'center', valign: 'middle', margin: 0,
  });
}

// ── Helper: content card ───────────────────────────────────────
function addCard(slide, cfg) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h,
    rectRadius: 0.06,
    fill: { color: cfg.fill || C.white },
    shadow: cfg.shadow !== false ? { type: 'outer', color: '8899AA', blur: 3, offset: 1, angle: 135, opacity: 0.08 } : undefined,
  });
  // left color band
  if (cfg.band) {
    slide.addShape(pptx.ShapeType.rect, {
      x: cfg.x, y: cfg.y + 0.06, w: 0.08, h: cfg.h - 0.12,
      fill: { color: cfg.band },
    });
  }
  const padL = cfg.band ? 0.24 : 0.18;
  const padR = 0.18;
  const textW = cfg.w - padL - padR;
  if (cfg.title) {
    slide.addText(cfg.title, {
      x: cfg.x + padL, y: cfg.y + 0.14, w: textW, h: 0.3,
      fontFace: TITLE_FONT, fontSize: 13, bold: true,
      color: C.ink, margin: 0, valign: 'top',
    });
  }
  if (cfg.body) {
    const bodyY = cfg.title ? cfg.y + 0.48 : cfg.y + 0.14;
    const bodyH = cfg.h - (cfg.title ? 0.6 : 0.28);
    slide.addText(cfg.body, {
      x: cfg.x + padL, y: bodyY, w: textW, h: bodyH,
      fontFace: BODY_FONT, fontSize: 10.2, color: C.slate,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.16,
    });
  }
}

// ── Helper: bullets in a card ──────────────────────────────────
function addCardWithBullets(slide, cfg) {
  addCard(slide, { x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h, band: cfg.band, fill: cfg.fill });
  const padL = cfg.band ? 0.24 : 0.18;
  const textW = cfg.w - padL - 0.18;
  let nextY = cfg.y + 0.14;
  // Title
  if (cfg.title) {
    slide.addText(cfg.title, {
      x: cfg.x + padL, y: nextY, w: textW, h: 0.28,
      fontFace: TITLE_FONT, fontSize: 12, bold: true,
      color: C.ink, margin: 0,
    });
    nextY += 0.34;
  }
  // Description — calculate height based on line count
  if (cfg.desc) {
    const charsPerLine = Math.floor(textW * 7); // rough estimate for Chinese chars
    const wrapLines = cfg.desc.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
    const rawDescH = Math.max(0.32, wrapLines * 0.2);
    const minBulletH = cfg.bullets && cfg.bullets.length > 0
      ? Math.min(1.2, cfg.bullets.length * 0.18 + 0.24)
      : 0;
    const maxDescH = Math.max(0.32, cfg.y + cfg.h - nextY - minBulletH - 0.18);
    const descH = Math.min(rawDescH, maxDescH);
    slide.addText(cfg.desc, {
      x: cfg.x + padL, y: nextY, w: textW, h: descH,
      fontFace: BODY_FONT, fontSize: 9.8, color: C.slate,
      margin: 0, valign: 'top', lineSpacingMultiple: 1.18,
    });
    nextY += descH + 0.08;
  }
  // Bullets
  if (cfg.bullets && cfg.bullets.length > 0) {
    const bulletH = Math.max(0.32, cfg.y + cfg.h - nextY - 0.14);
    const bulletFont = bulletH < 0.7 ? 9 : 9.6;
    const runs = cfg.bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, breakLine: i < cfg.bullets.length - 1 },
    }));
    slide.addText(runs, {
      x: cfg.x + padL, y: nextY, w: textW, h: bulletH,
      fontFace: BODY_FONT, fontSize: bulletFont, color: C.ink,
      margin: 0, valign: 'top', paraSpaceAfter: 2,
    });
  }
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 1 — Cover
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  setupSlide(s, true);
  // Left accent bar
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.aqua },
  });

  // Title block
  s.addText('Spec-Driven Development × GitHub Platform', {
    x: ML, y: 1.6, w: 6, h: 0.8,
    fontFace: TITLE_FONT, fontSize: 36, bold: true, color: C.white, margin: 0,
  });
  s.addText('深度集成设计方案', {
    x: ML, y: 2.5, w: 6, h: 0.6,
    fontFace: TITLE_FONT, fontSize: 24, color: C.aqua, margin: 0,
  });
  s.addText('以 Spec-Driven Development 为主线，构建需求、设计、任务、实现与验证的闭环研发体系', {
    x: ML, y: 3.35, w: 5.5, h: 0.7,
    fontFace: BODY_FONT, fontSize: 12, color: 'B0C4DE', margin: 0, lineSpacingMultiple: 1.3,
  });

  // Right info cards
  const stats = [
    { label: '双模式执行', value: '本地 IDE CLI + 云端 Custom Agent', color: C.teal },
    { label: 'SDD Agent 体系', value: '按企业场景灵活扩展，不固化数量', color: C.coral },
    { label: '统一产出层', value: 'Issues / Projects / Milestones / PRs', color: C.aqua },
  ];
  stats.forEach((st, i) => {
    const cy = 1.6 + i * 1.25;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.3, y: cy, w: 5.3, h: 1.0,
      rectRadius: 0.06, fill: { color: '1E3A56' },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 7.3, y: cy + 0.06, w: 0.08, h: 0.88,
      fill: { color: st.color },
    });
    s.addText(st.label, {
      x: 7.6, y: cy + 0.15, w: 2, h: 0.28,
      fontFace: TITLE_FONT, fontSize: 16, bold: true, color: C.white, margin: 0,
    });
    s.addText(st.value, {
      x: 7.6, y: cy + 0.5, w: 4.7, h: 0.28,
      fontFace: BODY_FONT, fontSize: 11, color: 'B0C4DE', margin: 0,
    });
  });

  // Bottom meta
  addPill(s, 'v3.0', ML, 5.8, C.coral, C.white, 0.9);
  s.addText('2026-03-15  ·  战略方案汇报', {
    x: ML + 1.25, y: 5.8, w: 3, h: 0.28,
    fontFace: BODY_FONT, fontSize: 10, color: 'B0C4DE', margin: 0, valign: 'middle',
  });

  addFooter(s, 1, '战略方案汇报', true);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 2 — Background & Goals
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '背景与目标', '先回答为什么要做，以及这套方案最终要解决什么', false);
  addPill(s, 'Why Now', 11.6, 0.46, C.coral, C.white, 1.0);

  // Three cards
  addCardWithBullets(s, {
    x: ML, y: 1.7, w: 3.75, h: 3.2, band: C.coral, fill: C.white,
    title: '当前痛点',
    desc: '需求文档、Issue、任务拆解和实现 PR 之间缺乏统一链路，AI 能力难以进入标准流程。',
    bullets: ['需求变化难同步到执行层', 'Issue 与技术方案脱节', 'AI 生成结果缺乏可追溯性'],
  });
  addCardWithBullets(s, {
    x: 4.65, y: 1.7, w: 3.75, h: 3.2, band: C.teal, fill: C.white,
    title: '方案目标',
    desc: '以 SDD 规范驱动开发为核心，将需求、方案、任务与交付统一接入 GitHub 协作对象。',
    bullets: ['统一 prd / plan / tasks / testplan / PR', '支持本地与云端两种执行方式', '让 Coding Agent 进入交付流程'],
  });
  addCardWithBullets(s, {
    x: 8.6, y: 1.7, w: 3.95, h: 3.2, band: C.aqua, fill: C.white,
    title: '成功标准',
    desc: '团队可以用相同规则定义需求、拆解任务、指派 AI 执行，并在 GitHub 上追踪全过程。',
    bullets: ['Feature 追踪到 Epic / Story / Task', 'Task 可直接指派给 Copilot', 'PR 与验收标准一一对应'],
  });

  // Bottom summary
  addCard(s, {
    x: ML, y: 5.2, w: CONTENT_W, h: 0.95, band: C.navy, fill: C.lightNavy,
    title: '核心判断',
    body: '不是再引入一个工具，而是以 SDD 方法论统一研发链路；Spec Kit 是其中关键最佳实践套件之一。',
  });

  addFooter(s, 2);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 3 — Architecture
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '总体架构', '执行层 → 自动化层 → 统一产出层，路径 A / B / C 共用同一套映射规则', false);
  addPill(s, 'Architecture', 10.8, 0.46, C.teal, C.white, 1.55);

  // Layer 1: GitHub Platform
  addCard(s, {
    x: ML, y: 1.7, w: CONTENT_W, h: 1.1, band: C.navy, fill: C.lightNavy,
    title: 'GitHub Platform 统一产出层',
    body: 'Issues（Epic / Story / Task） ·  Projects（状态与优先级） ·  Milestones（版本） ·  PRs（实现与评审）',
  });

  // Layer 2: Actions
  addCard(s, {
    x: ML + 0.8, y: 3.1, w: CONTENT_W - 1.6, h: 0.9, band: C.coral, fill: C.lightCoral,
    title: 'GitHub Actions 自动化编排层',
    body: 'specs/ 变更触发同步  ·  Task merge 后批量 assign Copilot  ·  PR merge 后自动关闭任务',
  });

  // Arrows between layers
  [4.5, 6.6, 8.7].forEach(x => {
    s.addShape(pptx.ShapeType.triangle, {
      x: x - 0.05, y: 2.85, w: 0.22, h: 0.22,
      fill: { color: C.gold }, rotate: 180,
    });
  });

  // Layer 3: Three paths
  const pathW = (CONTENT_W - 0.5) / 3;
  const paths = [
    { title: '路径 A · IDE CLI', body: 'SDD 规范命令\n生成 specs/ 文件产物\n同步到 GitHub', color: C.teal, fill: C.lightTeal },
    { title: '路径 B · Custom Agent', body: 'GitHub.com Agent Tab\n直接生成 spec / issue / PR\n无需本地环境', color: C.coral, fill: C.lightCoral },
    { title: '路径 C · Hybrid', body: 'A 生成规范产物\nB 执行拆解与实现\n推荐落地方式', color: C.aqua, fill: C.lightAqua },
  ];
  paths.forEach((p, i) => {
    const px = ML + i * (pathW + 0.25);
    addCard(s, {
      x: px, y: 4.3, w: pathW, h: 2.0, band: p.color, fill: p.fill,
      title: p.title, body: p.body,
    });
    // arrow up from path to actions
    s.addShape(pptx.ShapeType.triangle, {
      x: px + pathW / 2 - 0.1, y: 4.05, w: 0.22, h: 0.22,
      fill: { color: C.gold },
    });
  });

  addFooter(s, 3);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 4 — Dual Modes
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '双模式执行路径', '路径 A 与路径 B 不互斥，路径 C 是推荐落地方式', false);
  addPill(s, 'Execution Modes', 10.5, 0.46, C.coral, C.white, 1.85);

  const colW = (CONTENT_W - 0.5) / 3;

  addCardWithBullets(s, {
    x: ML, y: 1.7, w: colW, h: 4.85, band: C.teal, fill: C.lightTeal,
    title: '路径 A · IDE CLI',
    desc: '适合架构师与开发人员在本地反复推演。通过 SDD 规范命令生成产物，再同步到 GitHub。',
    bullets: ['本地可控，适合深度设计', '依赖 CLI 与扩展能力', '更适合生成长期维护文档', '支持离线场景'],
  });

  addCardWithBullets(s, {
    x: ML + colW + 0.25, y: 1.7, w: colW, h: 4.85, band: C.coral, fill: C.lightCoral,
    title: '路径 B · Custom Agent',
    desc: '适合产品经理、项目经理及分布式团队直接在 GitHub.com 上发起需求、拆解任务并让 Coding Agent 执行。',
    bullets: ['无需本地环境，门槛更低', '更贴近 Issue / PR 协作', '非研发角色可直接使用', 'AI 原生执行链路'],
  });

  addCardWithBullets(s, {
    x: ML + 2 * (colW + 0.25), y: 1.7, w: colW, h: 4.85, band: C.aqua, fill: C.lightAqua,
    title: '路径 C · Hybrid',
    desc: '把高思考密度活动放在本地，把高协作密度活动放在 GitHub。共享统一映射规则与产物格式。',
    bullets: ['Constitution/Plan 偏本地', 'Specify/Tasks/Implement 偏云端', '交付效率与治理能力兼得', '推荐的生产模式'],
  });

  addFooter(s, 4);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 5 — Recommended Hybrid Mode
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '推荐的混合模式', '不是二选一，而是把不同角色放到最适合的工作位置', false);
  addPill(s, 'Best Practice', 10.6, 0.46, C.aqua, C.navy, 1.7);

  const stages = [
    { phase: 'Constitution', role: '架构师', mode: 'A', color: C.teal },
    { phase: 'Specify',      role: '产品经理', mode: 'B', color: C.coral },
    { phase: 'Clarify',      role: 'PM/架构', mode: 'B', color: C.coral },
    { phase: 'Plan',         role: '架构师', mode: 'A/B', color: C.aqua },
    { phase: 'Tasks',        role: 'PMO/架构', mode: 'B', color: C.coral },
    { phase: 'Testplan',     role: 'QA', mode: 'B', color: C.coral },
    { phase: 'Implement',    role: '开发+AI', mode: 'B', color: C.coral },
    { phase: 'Review',       role: '全员', mode: 'B', color: C.coral },
    { phase: 'Verify',       role: '全员', mode: 'B', color: C.coral },
  ];

  // Use a table-like layout for stage cards
  const gap = 0.1;
  const cardW = (CONTENT_W - (stages.length - 1) * gap) / stages.length;

  stages.forEach((st, i) => {
    const cx = ML + i * (cardW + gap);
    const modeColor = st.mode === 'A' ? C.teal : st.mode === 'B' ? C.coral : C.aqua;

    s.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: 1.85, w: cardW, h: 2.7,
      rectRadius: 0.05,
      fill: { color: C.white },
      shadow: { type: 'outer', color: '8899AA', blur: 2, offset: 1, angle: 135, opacity: 0.06 },
    });
    // Top color bar
    s.addShape(pptx.ShapeType.rect, {
      x: cx, y: 1.85, w: cardW, h: 0.06,
      fill: { color: modeColor },
    });
    // Phase name
    s.addText(st.phase, {
      x: cx, y: 2.05, w: cardW, h: 0.4,
      fontFace: TITLE_FONT, fontSize: 9, bold: true, color: C.ink,
      align: 'center', valign: 'middle', margin: 0,
    });
    // Role
    s.addText(st.role, {
      x: cx + 0.05, y: 2.65, w: cardW - 0.1, h: 0.65,
      fontFace: BODY_FONT, fontSize: 8, color: C.slate,
      align: 'center', valign: 'top', margin: 0,
    });
    // Mode pill
    addPill(s, st.mode, cx + (cardW - 0.65) / 2, 3.65, modeColor, st.mode === 'A/B' ? C.navy : C.white, 0.65);

    // Arrow between cards
    if (i < stages.length - 1) {
      s.addText('→', {
        x: cx + cardW, y: 2.65, w: gap, h: 0.4,
        fontFace: BODY_FONT, fontSize: 14, color: C.gold, align: 'center', valign: 'middle', margin: 0,
      });
    }
  });

  // Timeline line
  s.addShape(pptx.ShapeType.line, {
    x: ML, y: 5.05, w: CONTENT_W, h: 0,
    line: { color: C.gold, width: 2 },
  });

  // Summary card
  addCard(s, {
    x: ML, y: 5.35, w: CONTENT_W, h: 0.9, band: C.navy, fill: C.lightNavy,
    title: '推荐原因',
    body: '把"高治理、高结构化"活动前置到 prd/plan，把"高协作、高并行"活动后置到 issue/task/pr。',
  });

  addFooter(s, 5);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 6 — Team Roles
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '团队角色与职责分工', '用角色定义保障方案可落地，而不是只有工具没有责任边界', false);
  addPill(s, 'Team Model', 10.8, 0.46, C.teal, C.white, 1.5);

  const colW = (CONTENT_W - 0.5) / 3;

  const roles = [
    { x: ML, y: 1.7, w: colW, color: C.coral, title: '产品经理（PM）', desc: '需求定义与验收守门人', bullets: ['需求定义 → specify/prd Agent', '需求澄清 → clarify Agent', '需求评审 → Review PRD/Spec PR', '优先级排序 → Project Board 管理'] },
    { x: ML + colW + 0.25, y: 1.7, w: colW, color: C.teal, title: '项目经理（PMO）', desc: '进度管控与资源协调', bullets: ['流程编排 → 推动各阶段 Review', '进度追踪 → Project Board 监控', '里程碑管理 → 关联版本和截止日', '资源调度 → Assign Copilot/开发者'] },
    { x: ML + 2 * (colW + 0.25), y: 1.7, w: colW, color: C.aqua, title: '架构师（Architect）', desc: '技术决策与质量保障', bullets: ['项目原则 → constitution Agent', '技术方案 → plan Agent', '数据建模 → data-model/contracts', '架构评审 → 关键 PR Review'] },
    { x: ML + 1.0, y: 4.3, w: 4.9, color: C.navy, title: '开发人员（Developer）', desc: '代码实现与质量防线', bullets: ['任务实现 → 按 Task Issue 编码', 'AI 辅助 → implement Agent', '测试编写 → 围绕验收标准', '代码审查 → Review AI 生成的 PR'] },
    { x: ML + 6.05, y: 4.3, w: 4.9, color: C.gold, title: '质量工程师（QA）', desc: '测试设计与验证闭环', bullets: ['测试计划 → testplan Agent', '测试执行 → 覆盖 AC 与回归', '质量反馈 → 缺陷进入 Issue 流转', '验收支持 → 输出验证结论'] },
  ];

  roles.forEach(r => {
    addCardWithBullets(s, {
      x: r.x, y: r.y, w: r.w, h: 2.4, band: r.color, fill: C.white,
      title: r.title, desc: r.desc, bullets: r.bullets,
    });
  });

  addFooter(s, 6);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 7 — RACI Matrix
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '角色 × SDD 阶段职责矩阵', '用 RACI 明确谁负责执行、谁审批、谁咨询、谁被知会', false);
  addPill(s, 'RACI', 11.6, 0.46, C.coral, C.white, 0.75);

  const headerOpts = { fill: { color: C.navy }, color: C.white, bold: true, align: 'center', fontSize: 10.5 };
  const cellCenter = { align: 'center', fontSize: 10 };

  // Color coding for RACI cells
  function raciCell(val) {
    const colors = { R: { fill: { color: 'DBEAFE' }, color: '1E40AF' }, A: { fill: { color: 'FEE2E2' }, color: '991B1B' }, C: { fill: { color: 'ECFDF5' }, color: '065F46' }, I: { fill: { color: 'F3F4F6' }, color: '6B7280' } };
    return { text: val, options: { ...cellCenter, ...(colors[val] || {}), bold: val === 'R' || val === 'A' } };
  }

  s.addTable([
    [
      { text: '阶段', options: headerOpts },
      { text: '产品经理', options: headerOpts },
      { text: '项目经理', options: headerOpts },
      { text: '架构师', options: headerOpts },
      { text: '开发人员', options: headerOpts },
      { text: 'QA 工程师', options: headerOpts },
    ],
    [{ text: 'Constitution', options: { bold: true, fontSize: 11 } }, raciCell('C'), raciCell('I'), raciCell('R'), raciCell('I'), raciCell('I')],
    [{ text: 'Specify', options: { bold: true, fontSize: 11 } }, raciCell('R'), raciCell('I'), raciCell('C'), raciCell('I'), raciCell('I')],
    [{ text: 'Clarify', options: { bold: true, fontSize: 11 } }, raciCell('R'), raciCell('C'), raciCell('C'), raciCell('C'), raciCell('I')],
    [{ text: 'Plan', options: { bold: true, fontSize: 11 } }, raciCell('C'), raciCell('I'), raciCell('R'), raciCell('C'), raciCell('I')],
    [{ text: 'Analyze', options: { bold: true, fontSize: 11 } }, raciCell('A'), raciCell('I'), raciCell('R'), raciCell('I'), raciCell('I')],
    [{ text: 'Tasks', options: { bold: true, fontSize: 11 } }, raciCell('C'), raciCell('A'), raciCell('R'), raciCell('C'), raciCell('I')],
    [{ text: 'Testplan', options: { bold: true, fontSize: 11 } }, raciCell('C'), raciCell('I'), raciCell('C'), raciCell('I'), raciCell('R')],
    [{ text: 'Implement', options: { bold: true, fontSize: 11 } }, raciCell('I'), raciCell('C'), raciCell('C'), raciCell('R'), raciCell('I')],
    [{ text: 'Review', options: { bold: true, fontSize: 11 } }, raciCell('A'), raciCell('I'), raciCell('A'), raciCell('R'), raciCell('C')],
    [{ text: 'Verify', options: { bold: true, fontSize: 11 } }, raciCell('A'), raciCell('I'), raciCell('A'), raciCell('R'), raciCell('R')],
  ], {
    x: ML, y: 1.72, w: 8.5, h: 4.8,
    colW: [1.55, 1.35, 1.35, 1.35, 1.35, 1.35],
    border: { pt: 1, color: C.line },
    fontFace: BODY_FONT, fontSize: 10, color: C.ink,
    margin: 0.04, valign: 'middle',
  });

  // Legend cards on the right
  addCard(s, { x: 9.35, y: 1.72, w: 3.25, h: 1.5, band: C.teal, fill: C.white, title: 'RACI 说明', body: 'R = Responsible 执行\nA = Accountable 审批\nC = Consulted 咨询\nI = Informed 知会' });
  addCard(s, { x: 9.35, y: 3.45, w: 3.25, h: 1.35, band: C.coral, fill: C.white, title: '管理含义', body: '需求由 PM 负责\n方案由架构负责\n执行由开发主导\n验证由 QA 协同' });
  addCard(s, { x: 9.35, y: 5.05, w: 3.25, h: 1.15, band: C.aqua, fill: C.white, title: '落地建议', body: '将角色映射到 Agent 与仓库权限，避免职责重叠与责任空白。' });

  addFooter(s, 7);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 8 — SDD Agent System
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, 'SDD Agent 体系', '按阶段组合 Agent，不固定数量；根据企业场景灵活增删', false);
  addPill(s, 'Agents', 11.0, 0.46, C.coral, C.white, 1.05);

  const colW = (CONTENT_W - 0.5) / 3;
  const rowH = 1.58;
  const agentCards = [
    { title: 'constitution', color: C.teal, fill: C.lightTeal, desc: '项目原则\n输出 constitution.md' },
    { title: 'specify/prd', color: C.coral, fill: C.lightCoral, desc: '需求定义\n输出 prd.md/spec.md' },
    { title: 'clarify', color: C.aqua, fill: C.lightAqua, desc: '需求澄清\n更新需求文档' },
    { title: 'plan', color: C.navy, fill: C.lightNavy, desc: '技术方案\n输出 plan.md/contracts' },
    { title: 'analyze（可选）', color: C.gold, fill: C.cream, desc: '只读一致性分析\n不直接写入产物' },
    { title: 'tasks', color: C.coral, fill: C.lightCoral, desc: '任务拆解\n输出 tasks.md + issues' },
    { title: 'testplan', color: C.teal, fill: C.lightTeal, desc: '测试计划\n输出 testplan.md' },
    { title: 'implement', color: C.navy, fill: C.lightNavy, desc: '代码实现\n输出 PR + 状态更新' },
    { title: 'review', color: C.aqua, fill: C.lightAqua, desc: '代码审查\n输出审查结论' },
  ];

  agentCards.forEach((a, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = ML + col * (colW + 0.25);
    const y = 1.72 + row * (rowH + 0.18);
    addCard(s, { x, y, w: colW, h: rowH, band: a.color, fill: a.fill, title: a.title, body: a.desc });
  });

  addCard(s, {
    x: ML, y: 6.68 - 0.7, w: CONTENT_W, h: 0.65, band: C.navy, fill: C.lightNavy,
    title: '说明',
    body: '本页给出统一能力地图：可采用 speckit-* 命名或角色动作命名，关键是输入输出与门控一致。',
  });

  addFooter(s, 8);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 9 — SDD Mapping
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, 'SDD 产物 × GitHub 对象映射', '与 v2 统一：文档驱动，GitHub 执行；需求、方案、任务、验证全链路可追踪', false);
  addPill(s, 'Mapping', 11.2, 0.46, C.teal, C.white, 1.05);

  const thOpts = { fill: { color: C.navy }, color: C.white, bold: true, align: 'center', fontSize: 11 };
  const tdOpts = { fontSize: 10.5 };

  s.addTable([
    [{ text: 'SDD 阶段 / Agent', options: thOpts }, { text: '文档产物', options: thOpts }, { text: 'GitHub 对象与规则', options: thOpts }],
    [{ text: 'specify/prd', options: tdOpts }, 'prd.md / spec.md', '同步 Epic + Story Issues；验收标准转为 checklist'],
    [{ text: 'clarify', options: tdOpts }, '更新 prd.md / spec.md', '针对不明确项创建或更新 needs-clarification Issue'],
    [{ text: 'plan', options: tdOpts }, 'plan.md + contracts + data-model', '创建/更新 Milestone 与 Project 卡片'],
    [{ text: 'tasks', options: tdOpts }, 'tasks.md', '批量创建 Task Issues，标记优先级/并行/依赖并进入 Board'],
    [{ text: 'testplan', options: tdOpts }, 'testplan.md', '在 Project 中追踪测试覆盖与验证状态'],
    [{ text: 'implement', options: tdOpts }, '代码与测试变更', '创建 PR，回写 Issue 状态并关联 Milestone'],
  ], {
    x: ML, y: 1.72, w: CONTENT_W, h: 3.8,
    colW: [2.1, 2.5, CONTENT_W - 4.6],
    border: { pt: 1, color: C.line },
    fontFace: BODY_FONT, fontSize: 10.5, color: C.ink,
    margin: [0.04, 0.08, 0.04, 0.08], valign: 'middle',
    autoPage: false,
  });

  const bw = (CONTENT_W - 0.3) / 2;
  addCard(s, {
    x: ML, y: 5.74, w: bw, h: 0.82, band: C.coral, fill: C.lightCoral,
    title: '关键幂等策略',
    body: 'Issue body 写入唯一元数据（feature/task 标识），重复同步仅更新不重复创建。',
  });
  addCard(s, {
    x: ML + bw + 0.3, y: 5.74, w: bw, h: 0.82, band: C.aqua, fill: C.lightAqua,
    title: '对交付质量的价值',
    body: 'Task Issue 携带 prd/plan/contracts/testplan 上下文，提升 AI 实现和 Review 质量。',
  });

  addFooter(s, 9);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 10 — End-to-End Workflow
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '端到端工作流示例', '扩展 QA 闭环：测试计划并行生成，验证前置；不显式依赖 bug-report agent', false);
  addPill(s, 'Workflow', 11.0, 0.46, C.aqua, C.navy, 1.25);

  const steps = [
    { num: '1', title: '需求输入', body: 'PM 通过 specify/prd Agent 输入业务需求', color: C.coral },
    { num: '2', title: '生成需求', body: '产出 prd/spec 并同步 Epic/Story Issues', color: C.teal },
    { num: '3', title: '方案设计', body: '架构师运行 plan，补齐 contracts/data-model', color: C.aqua },
    { num: '4', title: '任务拆解', body: 'tasks 生成 tasks.md 并创建 Task Issues', color: C.navy },
  ];
  const steps2 = [
    { num: '5', title: '测试计划', body: 'QA 并行生成 testplan.md 并关联验收标准', color: C.gold },
    { num: '6', title: '指派实现', body: 'PMO 将可执行任务 assign 给 Copilot/开发者', color: C.coral },
    { num: '7', title: '自动 PR', body: 'implement 生成代码与测试 PR 并回写状态', color: C.teal },
    { num: '8', title: 'QA 验证', body: '按 testplan 验证后进入 Review 与合并', color: C.aqua },
  ];

  function drawStepRow(items, baseY, slide) {
    const stepW = (CONTENT_W - (items.length - 1) * 0.3) / items.length;
    items.forEach((step, i) => {
      const sx = ML + i * (stepW + 0.3);
      slide.addShape(pptx.ShapeType.ellipse, {
        x: sx + stepW / 2 - 0.2, y: baseY, w: 0.4, h: 0.4,
        fill: { color: step.color },
      });
      slide.addText(step.num, {
        x: sx + stepW / 2 - 0.2, y: baseY, w: 0.4, h: 0.4,
        fontFace: BODY_FONT, fontSize: 14, bold: true, color: C.white, align: 'center', valign: 'middle', margin: 0,
      });
      slide.addText(step.title, {
        x: sx, y: baseY + 0.5, w: stepW, h: 0.3,
        fontFace: TITLE_FONT, fontSize: 11, bold: true, color: C.ink, align: 'center', margin: 0,
      });
      slide.addText(step.body, {
        x: sx + 0.1, y: baseY + 0.85, w: stepW - 0.2, h: 0.7,
        fontFace: BODY_FONT, fontSize: 9.2, color: C.slate, align: 'center', margin: 0, valign: 'top', lineSpacingMultiple: 1.1,
      });
      if (i < items.length - 1) {
        slide.addText('→', {
          x: sx + stepW, y: baseY + 0.1, w: 0.3, h: 0.3,
          fontFace: BODY_FONT, fontSize: 18, color: C.gold, align: 'center', valign: 'middle', margin: 0,
        });
      }
    });
  }

  drawStepRow(steps, 1.8, s);
  s.addText('↓', {
    x: ML + CONTENT_W / 2 - 0.15, y: 3.45, w: 0.3, h: 0.35,
    fontFace: BODY_FONT, fontSize: 20, color: C.gold, align: 'center', valign: 'middle', margin: 0,
  });
  drawStepRow(steps2, 3.9, s);

  addCard(s, {
    x: ML, y: 5.7, w: CONTENT_W, h: 0.8, band: C.navy, fill: C.lightNavy,
    title: '核心闭环',
    body: '需求不止停留在文档，而是在 Issue / Task / PR 链路持续验证，最终由 QA 与验收标准共同回收。',
  });

  addFooter(s, 10);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 11 — Roadmap
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '实施路线图', '分五个阶段推进，优先实现成本更低、价值更高的路径 B', false);
  addPill(s, 'Roadmap', 11.0, 0.46, C.coral, C.white, 1.25);

  const phases = [
    { title: 'Phase 1', sub: 'Agent 设计与门控', body: '定义核心 .agent.md\n完成 prompt 与人工门控规则', color: C.coral },
    { title: 'Phase 2', sub: 'SDD 产物落地', body: '规范 prd/plan/tasks/testplan\n打通文档与仓库结构', color: C.teal },
    { title: 'Phase 3', sub: 'Actions 自动化', body: 'spec 变更同步\nTask 自动 assign\nPR 自动关单', color: C.aqua },
    { title: 'Phase 4', sub: 'Projects 模板', body: '构建 Board/Table 视图\n字段规范化', color: C.navy },
    { title: 'Phase 5', sub: '验证与推广', body: '试点运行\n幂等验证\n文档沉淀与推广', color: C.gold },
  ];

  const phaseW = (CONTENT_W - 4 * 0.2) / 5;
  phases.forEach((p, i) => {
    const px = ML + i * (phaseW + 0.2);
    const py = 1.8;

    addCard(s, { x: px, y: py, w: phaseW, h: 2.7, band: p.color, fill: C.white });

    // Phase number pill
    addPill(s, p.title, px + 0.2, py + 0.2, p.color, i === 4 ? C.ink : C.white, 0.85);

    // Sub title
    s.addText(p.sub, {
      x: px + 0.2, y: py + 0.62, w: phaseW - 0.4, h: 0.3,
      fontFace: TITLE_FONT, fontSize: 11, bold: true, color: C.ink, margin: 0,
    });

    // Body
    s.addText(p.body, {
      x: px + 0.2, y: py + 1.0, w: phaseW - 0.4, h: 1.4,
      fontFace: BODY_FONT, fontSize: 10, color: C.slate, margin: 0, valign: 'top', lineSpacingMultiple: 1.3,
    });

    // Timeline dot
    const dotY = 4.9;
    s.addShape(pptx.ShapeType.ellipse, {
      x: px + phaseW / 2 - 0.15, y: dotY, w: 0.3, h: 0.3,
      fill: { color: p.color },
    });
    s.addText(String(i + 1), {
      x: px + phaseW / 2 - 0.15, y: dotY, w: 0.3, h: 0.3,
      fontFace: BODY_FONT, fontSize: 10, bold: true, color: i === 4 ? C.ink : C.white,
      align: 'center', valign: 'middle', margin: 0,
    });
  });

  // Timeline line
  s.addShape(pptx.ShapeType.line, {
    x: ML + phaseW / 2, y: 5.05, w: CONTENT_W - phaseW, h: 0,
    line: { color: C.line, width: 2 },
  });

  // Priority note
  addCard(s, {
    x: ML, y: 5.6, w: CONTENT_W, h: 0.9, band: C.coral, fill: C.lightCoral,
    title: '优先级建议',
    body: '先做路径 B：优先验证 SDD 在 GitHub 的闭环价值；路径 A 与 Actions 作为增量增强。',
  });

  addFooter(s, 11);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 12 — Validation & Risks
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '验证方案与关键风险', '同时证明"能跑通"和"可持续"，验证与风险要一起设计', false);
  addPill(s, 'Validation', 10.8, 0.46, C.teal, C.white, 1.5);

  const colW = (CONTENT_W - 0.3) / 2;

  addCardWithBullets(s, {
    x: ML, y: 1.7, w: colW, h: 3.8, band: C.aqua, fill: C.lightAqua,
    title: '验证方案',
    desc: '建议在测试仓库按最短路径完成 5 类验证：',
    bullets: [
      'Custom Agent 验证：specify / plan / tasks / implement 依次跑通',
      'CLI 同步验证：/speckit.gh-sync 正确创建或更新对象',
      '幂等验证：多次同步不重复创建 Issue',
      '混合模式验证：A 生成 spec，B 读取并创建 tasks 与 PR',
      'QA 验证：testplan 与验收标准覆盖矩阵一致',
    ],
  });

  addCardWithBullets(s, {
    x: ML + colW + 0.3, y: 1.7, w: colW, h: 3.8, band: C.coral, fill: C.lightCoral,
    title: '关键风险与限制',
    desc: '需要关注的技术与流程风险：',
    bullets: [
      'github/* 写权限依赖仓库配置',
      '双向同步先不做，避免复杂度过早上升',
      '跨仓库协同与 Packages/Releases 暂不纳入一期',
      '流程门控执行不到位会导致批量写入风险',
    ],
  });

  // Judgment
  addCard(s, {
    x: ML, y: 5.8, w: CONTENT_W, h: 0.8, band: C.navy, fill: C.lightNavy,
    title: '判断标准',
    body: '试点成功不是“生成了文档”，而是“一个 Feature 可从 prd/spec 追踪到 Task 与 PR，并被团队稳定复用”。',
  });

  addFooter(s, 12);
}

// ════════════════════════════════════════════════════════════════
//  SLIDE 13 — Benefits & Next Steps
// ════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  addHeader(s, '预期收益与下一步', '从规范、协作、自动化三个维度收口，形成清晰的决策建议', true);
  addPill(s, 'Decision', 11.2, 0.5, C.coral, C.white, 1.05);

  const colW = (CONTENT_W - 0.5) / 3;

  // Benefits
  addCardWithBullets(s, {
    x: ML, y: 1.7, w: colW, h: 3.8, band: C.aqua, fill: C.white,
    title: '预期收益',
    bullets: [
      '需求到交付链路标准化',
      'AI 生成更可控、更可审计',
      '项目透明度显著提升',
      '任务拆解与执行自动化增强',
      '团队协作成本下降',
    ],
  });

  // Decision
  addCardWithBullets(s, {
    x: ML + colW + 0.25, y: 1.7, w: colW, h: 3.8, band: C.teal, fill: C.white,
    title: '建议决策',
    bullets: [
      '先在单一试点仓库实现路径 B',
      '优先落地 specify/prd / plan / tasks / testplan / implement',
      '路径 A 与 Actions 自动化作为二期增强',
    ],
  });

  // Next steps
  addCardWithBullets(s, {
    x: ML + 2 * (colW + 0.25), y: 1.7, w: colW, h: 3.8, band: C.coral, fill: C.white,
    title: '下一步动作',
    bullets: [
      '选定试点仓库与责任人',
      '编写 .github/agents/*.agent.md',
      '建立测试 Project Board',
      '运行端到端演练',
      '沉淀操作手册并复制推广',
    ],
  });

  // Conclusion
  s.addShape(pptx.ShapeType.roundRect, {
    x: ML, y: 5.85, w: CONTENT_W, h: 0.7,
    rectRadius: 0.06, fill: { color: '1E3A56' },
  });
  s.addText('结论：推荐以"路径 B 先行、路径 C 收口、路径 A 增强"的策略推进', {
    x: ML, y: 5.85, w: CONTENT_W, h: 0.7,
    fontFace: TITLE_FONT, fontSize: 18, bold: true,
    color: C.white, align: 'center', valign: 'middle', margin: 0,
  });

  addFooter(s, 13, '建议启动试点', true);
}

// ── Write file ─────────────────────────────────────────────────
pptx.writeFile({ fileName: 'e:/公司/6伊登/26年3月/github-ai-solution/v3/SpecKit-GitHub-Platform-Design-Deck-v3-optimized.pptx' })
  .then(() => console.log('✅ PPT generated successfully'))
  .catch(err => console.error('❌ Error:', err));
