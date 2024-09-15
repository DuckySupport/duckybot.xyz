@echo off

echo Pushing to GitHub repository: NickIsADev/duckybot.xyz
git add .
git commit -m "%*"
git push origin main
echo Pushed changes to GitHub repository: NickIsADev/duckybot.xyz