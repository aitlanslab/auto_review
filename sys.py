import os
import subprocess

def get_model_name():
    try:
        out = subprocess.run(
            ['powershell', '-NoProfile', '-Command',
             '(Get-CimInstance Win32_ComputerSystem).Model'],
            capture_output=True, text=True, timeout=5,
            creationflags=subprocess.CREATE_NO_WINDOW,  # no console flash
        )
        name = out.stdout.strip()
        return name or None
    except (OSError, subprocess.SubprocessError):
        return None
