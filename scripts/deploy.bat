@echo off
chcp 65001 >nul
REM ================================================================
REM  全球养老金政策动态追踪 — 一键部署脚本
REM  用法: 双击运行 或 scripts\deploy.bat
REM  功能: 自动 git add/commit/push，触发 GitHub Pages 更新
REM ================================================================

echo ═══════════════════════════════════════════════
echo   全球养老金政策动态追踪 — 一键部署
echo ═══════════════════════════════════════════════
echo.

REM 检查 git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 git，请先安装 https://git-scm.com/
    pause
    exit /b 1
)

echo [1/3] 检查文件变更...
git status --short

echo.
echo [2/3] 提交并推送...
set commit_msg=Weekly update: %DATE%
git add -A
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [提示] 没有新变更，无需提交。
    goto :push
)

:push
echo.
echo [3/3] 推送到 GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 部署成功！
    echo   网站将在 1-2 分钟后更新:
    echo   https://kevinvery.github.io/fudan-pension-monitor/
) else (
    echo.
    echo ❌ 推送失败，请检查网络连接和 GitHub 权限。
)

echo.
pause
