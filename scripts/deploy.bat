@echo off
REM ================================================================
REM  全球养老金政策动态追踪 — GitHub Pages 一键部署脚本
REM  使用方法：双击运行，或从命令行执行
REM ================================================================

echo === 全球养老金政策动态追踪 — GitHub Pages 部署工具 ===
echo.

REM 检查 git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 git，请先安装 https://git-scm.com/
    pause
    exit /b 1
)

echo [1/3] 正在初始化 Git 仓库...
if not exist .git (
    git init
    git config user.email "user@pension-monitor.local"
    git config user.name "Pension Monitor"
)

echo [2/3] 请登录 GitHub 并创建一个新仓库：
echo.
echo     a) 打开 https://github.com/new
echo     b) 仓库名：pension-tracker（或任意名称）
echo     c) 选择 Public（公开）
echo     d) 不要勾选任何初始化选项
echo     e) 点击 "Create repository"
echo.
echo [3/3] 创建后，将以下命令粘贴到终端运行：
echo.
echo     git remote add origin https://github.com/你的用户名/pension-tracker.git
echo     git branch -M main
echo     git push -u origin main
echo.
echo     然后到 GitHub 仓库 Settings ^> Pages 中：
echo     - Source 选择 "Deploy from a branch"
echo     - Branch 选择 "main"，文件夹选择 "/ (root)"
echo     - 点击 Save
echo.
echo     等待 2-3 分钟，你的网站就会出现在：
echo     https://你的用户名.github.io/pension-tracker/
echo.

pause
