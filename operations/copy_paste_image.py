import pyautogui as pilot
import time
from utils.executor import execute, is_element_present, load_and_click
from utils.operator import click_element

def copy_image():
    print("Copy image")
    position=190,423
    print(position)
    pilot.moveTo(position,duration=0.5)
    pilot.rightClick()
    copy_ss="images/bsi/copy_image.png"
    if(is_element_present(copy_ss)):
        click_element(copy_ss,confidence=0.8)
        return True
    if(is_element_present("images/bsi/no_image.png")):
        pilot.hotkey("ctrl","1")
        time.sleep(0.3)
        pilot.hotkey("ctrl","r")
        time.sleep(1)
    time.sleep(0.5)
    copy_image()

def paste_image():
    prompt_ss="images/chatgpt/prompt_input.png"
    if(is_element_present(prompt_ss)):
        click_element(prompt_ss,confidence=0.8)
        pilot.hotkey('ctrl', 'v')
        failed_ss="images/chatgpt/failed_upload.png"
        if(is_element_present(failed_ss,duration=1)):
            # Dismiss the error
            click_element("images/chatgpt/dismiss_failed_upload.png",confidence=0.8)
            print("Failed Upload")
            switch_chatgpt_account()
        return True
    else:
        # Input box not present
        return False
    return False

def chatgpt_logout():
    res=click_element("images/chatgpt/hamburger2.png",confidence=0.9)
    if res==False:
        click_element("images/chatgpt/hamburger.png",confidence=0.9)
    time.sleep(0.4)
    if is_element_present("images/chatgpt/claim_offer.png",duration=1):
        pilot.moveTo(1146,897,duration=0.5)
    else:
        pilot.moveTo(1243,971,duration=0.5)
    pilot.click()
    if(is_element_present("images/chatgpt/nav_logout.png")):
        click_element("images/chatgpt/nav_logout.png",confidence=0.8)
        if(is_element_present("images/chatgpt/confirm_logout.png")):
            click_element("images/chatgpt/confirm_logout.png",confidence=0.8)

curr_acc=0
acc_points=[
    (1619,267),
    (1619,346),
    (1619,436),
    (1619,526),
    (1619,616)
]

def chatgpt_login():
    global curr_acc
    res=load_and_click("images/chatgpt/login_btn.png")
    if res:
        if is_element_present("images/chatgpt/google_login.png",duration=1):
            pilot.click()
            time.sleep(0.5)
            pilot.click()
            time.sleep(0.5)
        google_login=load_and_click("images/chatgpt/google_login.png")
        account_selection=load_and_click("images/chatgpt/google_account.png")
        curr_acc=curr_acc+1
        from credentials import num_chatgpt_acc
        if curr_acc==num_chatgpt_acc:
            return False
        (x,y)=acc_points[curr_acc]
        pilot.moveTo(x,y,duration=0.5)
        pilot.click()
        successful=is_element_present("images/chatgpt/prompt_input.png",duration=50)
        if successful:
            regular_mode=load_and_click("images/chatgpt/regular_chat.png")
            return True
    else:
        print("Error Occured")
        pilot.hotkey("ctrl","2")
        pilot.moveTo(434,25,duration=0.5)
        pilot.click()
        time.sleep(0.5)
        pilot.moveTo(765,75,duration=0.5)
        pilot.click()
        time.sleep(0.5)
        pilot.hotkey("ctrl","a")
        time.sleep(0.5)
        pilot.typewrite("https://chatgpt.com/?temporary-chat=true",interval=0.05)
        pilot.press("enter")
        time.sleep(0.5)
        chatgpt_login()

def switch_chatgpt_account():
    chatgpt_logout()
    chatgpt_login()
    copy_paste_image()

def copy_paste_image():
    copy_status=copy_image()
    paste_status=paste_image()
    return True


