import pyautogui as pilot
import time
from credentials import prompt
from utils.executor import load_and_click, is_element_present, wait_for_first_image
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
    # Check if got response
    if is_element_present("images/bsi/success.png",duration=1):
        print("- Success")
        pilot.press("enter")
        time.sleep(1)
        return True
    if is_element_present("images/bsi/ok.png",duration=1):
        print("Found an alert")
        # Check if IPNI verification required
        if is_element_present("images/bsi/validate.png"):
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
                #load_and_click("images/bsi/extension_save.png",confidence=0.8)
                time.sleep(0.5)

                possiblilities=["images/bsi/completed.png","images/bsi/reject.png","images/bsi/flag.png"]
                res=wait_for_first_image(image_paths=possiblilities, max_time_to_wait=2)
                if res==0 or res==1 or res==2:
                    time.sleep(0.5)
                    print("Received Option")
                    print(res)
                    pilot.press("enter")
                    return True

                return False

        pilot.press("enter")
        time.sleep(0.5)
        return True

    pilot.press("enter")
    time.sleep(0.5)
    return True
    

def submit_response():
    print("Submit Response")
    return handle_extension()