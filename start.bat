@echo off
mode con: cols=20 lines=5
call venv\scripts\activate

python ui.py
pause