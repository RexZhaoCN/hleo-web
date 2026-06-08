# HLEO Website

翰林电子爱好者组织（HLEO）官方网站。基于 Nuxt 4 构建的单页落地页，包含社团介绍、新闻动态和 Turnstile 验证入会功能。

## 技术栈

- **框架**: Nuxt 4 + Vue 3
- **内容管理**: @nuxt/content（Markdown 驱动的新闻系统）
- **验证**: Cloudflare Turnstile
- **样式**: 纯 CSS，毛玻璃风格

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

开发服务器运行在 `http://localhost:3000`。

## 构建与部署

```bash
# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 环境变量

在项目根目录创建 `.env` 文件：

```
NUXT_PUBLIC_TURNSTILE_API_URL=https://qrcodeverifyapi.hleo.top
```

该变量指向 Cloudflare Worker 外部接口地址，用于 Turnstile 验证后的图片获取。

## 添加新闻文章

在 `content/posts/` 目录下创建 Markdown 文件，frontmatter 格式：

```markdown
---
title: 文章标题
date: 2026-05-08
coverImage: https://example.com/cover.jpg
description: 文章简介
---

正文内容...
```

## 项目结构

```
├── app/
│   └── app.vue          # 主页面（组件、逻辑、样式）
├── content/
│   └── posts/           # 新闻文章（Markdown）
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── server/              # 服务端（当前为空）
├── nuxt.config.ts       # Nuxt 配置
└── package.json
```
