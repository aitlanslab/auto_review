import time
import pyautogui as pilot
from checks.bsi import load_annotation
from checks.gemini import load_temp_chat, copy_image, paste_image, write_prompt, handle_response
from utils.executor import execute
from operations.copy_paste_image import copy_paste_image
from operations.submit_prompt import submit_prompt
from operations.submit_response import submit_response
from start import auto_start

pilot.moveTo(921,22,duration=0.5)
pilot.click()

while(True):
    print("Gemini working")
    time.sleep(1)
    load_temp_chat()
    write_prompt()
    image_found=copy_image()
    if not image_found:
        break
    paste_image()
    
    # Start timer before calling handle_response
    start_time = time.time()
    response_handled = handle_response()
    elapsed_time = time.time() - start_time

    # Check if response was handled and within time limit
    if response_handled and elapsed_time <= 60:
        submit_response()
    else:
        pilot.hotkey("ctrl","1")
        time.sleep(0.3)
        pilot.hotkey("ctrl","r")
        time.sleep(0.3)
        pilot.hotkey("ctrl","2")
        time.sleep(0.3)
        pilot.hotkey("ctrl","r")
        time.sleep(5)
        continue 
    