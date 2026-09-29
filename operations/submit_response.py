import pyautogui as pilot
import time
from credentials import prompt
from utils.executor import load_and_click, is_element_present
from utils.operator import click_element
import worker
def handle_extension():
    # Switch to annotation tab
    
    pilot.hotkey("ctrl","1")
    time.sleep(0.2)
    click_element("images/bsi/extension.png",confidence=0.8)
    time.sleep(0.5)
    click_element("images/bsi/extension_input.png",confidence=0.8)
    time.sleep(0.5)
    pilot.hotkey("ctrl","v")
    time.sleep(0.5)
    click_element("images/bsi/extension_fill.png",confidence=0.8)
    time.sleep(0.2)
    click_element("images/bsi/extension_save.png",confidence=0.8)
    #worker.controller.pause()
    print("Checking alert")
    
    # Check if IPNI verification required
    if is_element_present("images/bsi/validate.png",duration=2):
        pilot.press("enter")
        load_and_click("images/bsi/b_ex.png")
        time.sleep(0.5)
        if(is_element_present("images/bsi/b_ex_out.png",duration=2)):
            pilot.press("enter")
            time.sleep(0.5)
            load_and_click("images/bsi/i_ex.png")
            time.sleep(0.5)
            load_and_click("images/bsi/i_ex_input.png")
            pilot.hotkey('ctrl', 'v')
            time.sleep(0.5)
            load_and_click("images/bsi/i_ex_btn.png")
            load_and_click("images/bsi/i_ex_out.png")
            pilot.press("enter")
            time.sleep(0.5)
            load_and_click("images/bsi/extension.png",confidence=0.8)
            time.sleep(0.5)
            load_and_click("images/bsi/extension_input.png",confidence=0.8)
            time.sleep(0.5)
            pilot.hotkey("ctrl","v")
            time.sleep(0.5)
            load_and_click("images/bsi/extension_fill.png",confidence=0.8)
            load_and_click("images/bsi/extension_save.png",confidence=0.8)
            time.sleep(0.5)
            if(is_element_present("images/bsi/completed.png",duration=2)):
                print("- Completed")
                pilot.press("enter")
                time.sleep(0.5)
                return True
            if(is_element_present("images/bsi/reject.png",duration=2)):
                print("- Reject")
                pilot.press("enter")
                time.sleep(0.5)
                return True
            if(is_element_present("images/bsi/flag.png",duration=2)):
                print("- Flag")
                pilot.press("enter")
                time.sleep(0.5)
                return True
            return False
    if is_element_present("images/bsi/reject.png",duration=2):
        print("- Reject")
        pilot.press("enter")
        time.sleep(0.5)
        return True
    
    time.sleep(1)
    return True
    
    """
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