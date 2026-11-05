import pyautogui as pilot
import time
from credentials import prompt
from utils.executor import load_and_click, load_and_scroll_click, execute, is_element_present
from utils.operator import click_element
import pyperclip

def write_prompt():
    pyperclip.copy("") # Clean the clipboard
    pyperclip.copy(prompt)
    pilot.hotkey("ctrl","v")
    time.sleep(1)
    pilot.press("enter")
    time.sleep(1)
    pilot.press("enter")
    time.sleep(1)
    pilot.press("enter")
    time.sleep(0.8)
    pyperclip.copy("") # Clean the clipboard
    while(is_element_present("images/gemini/send.png",duration=1,confidence=0.9)):
        load_and_click("images/gemini/send.png")
        time.sleep(0.2)
        pilot.click()

    time.sleep(1)
    if is_element_present("images/chatgpt/arrow_down.png",duration=1):
        click_element("images/chatgpt/arrow_down.png",confidence=0.8)
        pilot.moveTo(1195,935,duration=0.2)

    return True

from utils.executor import wait_for_first_image

def handle_response():
    print("Waiting for response")
    #successful=load_and_scroll_click("images/chatgpt/ok.png",duration=20)
    possiblilities=["images/chatgpt/ok.png","images/gemini/redo.png"]
    res=wait_for_first_image(image_paths=possiblilities,max_time_to_wait=20)
    if res==0:
        print("Found OK")
        load_and_scroll_click("images/chatgpt/ok.png",duration=2)
        return True
    if res==1:
        print("Found Failed - Need to redo")
        load_and_scroll_click("images/gemini/redo.png",duration=2)
        time.sleep(0.5)
        load_and_scroll_click("images/gemini/try_again.png",duration=2)
        time.sleep(0.5)
        handle_response()


    time.sleep(0.5)
    pilot.moveTo(1195,935,duration=0.5)
    pilot.click()
    pilot.click()
    time.sleep(0.3)
    pilot.typewrite("Give the response whatever you understand in the expected json format",interval=0.1)
    time.sleep(0.3)
    pilot.press("enter")
    pilot.press("enter")
    time.sleep(0.2)
    successful=load_and_scroll_click("images/chatgpt/ok.png",duration=20)
    if successful:
        print("Received Response")
        return True


    """
    if successful:
        print("Received Response")
        return True
    else:
        time.sleep(0.5)
        pilot.moveTo(1195,935,duration=0.5)
        pilot.click()
        pilot.click()
        time.sleep(0.3)
        pilot.typewrite("Give the response whatever you understand in the expected json format",interval=0.1)
        time.sleep(0.3)
        pilot.press("enter")
        pilot.press("enter")
        time.sleep(0.2)
        successful=load_and_scroll_click("images/chatgpt/ok.png",duration=20)
        if successful:
            print("Received Response")
            return True
    """
    
def submit_prompt():
    write_prompt()
    return handle_response()


