This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 配置项

- `NEXT_PUBLIC_API_BASE_URL`：后端API的基础URL，默认值为 `http://localhost:8081/api`。

## 环境变量配置

### 本地开发环境
1. 复制 `.env.example` 文件并重命名为 `.env.local`
2. 根据您的本地环境需求修改 `.env.local` 中的配置值
3. 启动开发服务器，系统会自动加载 `.env.local` 中的环境变量

### 部署环境配置

#### Vercel部署
1. 在Vercel控制台中打开您的项目
2. 导航至 "Settings" > "Environment Variables"
3. 添加所需的环境变量，例如：
   - `NEXT_PUBLIC_API_BASE_URL`：设置为您的生产API基础URL

#### 其他部署方式
1. 根据您使用的部署平台或CI/CD工具，设置相应的环境变量
2. 确保所有以 `NEXT_PUBLIC_` 开头的变量都被正确设置，这样它们才能在客户端JavaScript中访问

### 注意事项
- `.env`、`.env.local` 等环境变量文件已添加到 `.gitignore` 中，不会被提交到代码仓库
- 请务必使用 `.env.example` 文件作为参考，确保所有必要的环境变量都已配置
- 生产环境中，请使用正式的API端点，而不是本地开发服务器地址 
