import pyautogui as pilot
import time
from credentials import prompt
from utils.executor import load_and_click, is_element_present
import worker
def handle_extension():
    # Switch to annotation tab
    pilot.hotkey("ctrl","1")
    open_ex=load_and_click("images/bsi/extension.png",confidence=0.8)
    time.sleep(0.2)
    input_field=load_and_click("images/bsi/extension_input.png",confidence=0.8)
    time.sleep(0.2)
    pilot.hotkey("ctrl","v")
    time.sleep(0.2)
    load_and_click("images/bsi/extension_fill.png",confidence=0.8)
    time.sleep(1)
    #worker.controller.pause()
    print("Checking alert")

    #input_field=load_and_click("images/bsi/extension_save.png",confidence=0.8)
    if is_element_present("images/brave/alert_ok.png"):
        print("Found Alert Ok")
        if is_element_present("images/brave/reject.png"):
            print("Rejected")
            pilot.hotkey("enter")
            #worker.controller.pause()
            return True
        else:
            print("Need to resolve")
            worker.controller.pause()
            return False
            #pilot.hotkey("enter")
        
    return False
    """
    time.sleep(0.2)
    if is_element_present("images/bsi/success.png"):
        pilot.hotkey("enter")
        return True
    else:
        # check if popup still not dismissed
        ext_popup=pilot.locateOnScreen("images/bsi/extension_save.png",confidence=0.8)
        if ext_popup:
            time.sleep(0.2)
            pilot.hotkey("ctrl","1")
            time.sleep(0.2)
            pilot.hotkey("ctrl","r")
            time.sleep(2)
            handle_extension()
    if is_element_present("images/chatgpt/invalid_json.png"):
        time.sleep(0.3)
        pilot.hotkey("enter")
        pilot.moveTo(1378,238,duration=0.3)
        time.sleep(0.2)
        pilot.click()
        return True
    return False
    """


def submit_response():
    print("Submit Response")
    return handle_extension()