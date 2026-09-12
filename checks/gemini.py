import time
import pyautogui as pilot
from pyautogui import ImageNotFoundException
from utils.executor import load_and_click, load_and_scroll_click, execute, is_element_present
from utils.cursors import get
from utils.operator import click_element
from helpers.image import find
from credentials import prompt
import json
import worker
import pyperclip


def load_temp_chat():
    def swicth_to_temp_chat():
        attempts = 5
        for att in range(attempts):
            current = find("images/gemini/temp_chat_active.png", confidence=0.9)
            if current:
                print(f"Found temp on {(att+1)} attempts")
                return True
            # Check if temp chat is visible on top
            top_visibility = find("images/gemini/top_temp_chat.png", confidence=0.8)
            if top_visibility:
                curr_mode = find("images/gemini/top_temp_chat_active.png", confidence=1)
                if curr_mode:
                    print("Found Temp Chat")
                    return True
                else:
                    print("Need to enable temp chat")
                    temp_mode = load_and_click("images/gemini/top_temp_chat.png", confidence=0.8)
                    time.sleep(0.5)
                    continue
            else:
                # check if new chat available on top
                new_chat = find("images/gemini/top_new_chat.png")
                if new_chat:
                    load_and_click("images/gemini/top_new_chat.png", confidence=0.8)
                    pilot.moveTo(1787,211,duration=0.3)
                    continue
                # Open Navbar
                res = load_and_click("images/gemini/navbar.png", confidence=0.9)
                if res:
                    curr_mode = find("images/gemini/temp_chat_active.png", confidence=1)
                    if curr_mode:
                        print("Found Temp Chat")
                        return True
                    else:
                        print("Need to enable temp chat")
                        pilot.press("tab",interval=0.1)
                        time.sleep(0.1)
                        pilot.press("tab",interval=0.1)
                        time.sleep(0.1)
                        pilot.press("tab",interval=0.1)
                        time.sleep(0.1)
                        pilot.press("enter",interval=0.1)
                        time.sleep(0.1)
                        time.sleep(0.5)
                        continue
                    print(f"Attemps {(att+1)}")
                    continue
    
    def dismiss_intro():
        print("Need to Dismiss intro")
        res = find("images/gemini/intro.png")
        if res:
            load_and_click("images/gemini/intro_close.png")
        return True
    
    swicth_to_temp_chat()
    dismiss_intro()

def copy_image():
    no_img = "images/no_image.png"

    # Exit immediately if no image exists
    if find(no_img):
        print("No Image")
        return False

    copy_ss = "images/bsi/copy_image.png"

    while True:
        position = (190, 423)

        pilot.moveTo(position, duration=0.5)
        pilot.rightClick()

        # Success case
        if find(copy_ss):
            click_element(copy_ss, confidence=0.8)
            time.sleep(0.5)
            return True

        # Retry case
        if find("images/bsi/no_image.png"):
            pilot.hotkey("ctrl", "1")
            time.sleep(0.3)

            pilot.hotkey("ctrl", "r")
            time.sleep(1)

        time.sleep(0.5)



def paste_image():
    prompt_ss = "images/gemini/attachment_input.png"

    if find(prompt_ss):
        click_element(prompt_ss, confidence=0.8)
        time.sleep(1)

        pilot.hotkey('ctrl', 'v')
        time.sleep(3)

        send_btn = "images/gemini/send.png"

        # Wait until send button appears
        print("Waiting for send btn visibility")
        while not find(send_btn):
            time.sleep(0.8)
        print("got send btn")
        print(find(send_btn))
        time.sleep(1)
        pilot.press("enter")
        time.sleep(1)
        return True

    return False


def write_prompt():
    print("Writing prompt")
    time.sleep(0.5)
    pilot.hotkey("ctrl","1")
    click_element("images/gemini/reverse.png",confidence=0.8)
    time.sleep(1)
    pilot.hotkey("enter")
    reverse_json=pyperclip.paste()
    prompt=f"""You are a OCR machine understand handwritings and herbarium sheet, compare the json information with the attached image and fix the existing field values, you should:
     1. Remove all the field values which are not present in the image but are present in the json.  
     2. Remove all the field values which are not clearly understandable due to complex handwriting in the image.
     3. Fix known common spellings of place names if it is clearly visible and identified confidently else remove the field value, but do not assume and fill any field vules if it is not present in the image. 
     4. Make all the handwritten fields true, if the field value is available and is handwritten.
     5. Only put/keep collector name if it present in the image and is clearly vislble and understandable. Do not consider the name as collector name if the word "Herb." is a prefix, collector name will mostly have prefix : "Leg.","Com.","Coll.". 
     6. For collection date, only fill the value of date, month and year if it is clearly visible. 
     7. Only keep the country field value if the country name is available in the image, or if it is possible to predict from the state name.
     8. Only keep the state name value if it is present and clearly understandable in the image.
     9. Only keep the locality value if it is present and clearly understandable in the image.
     Do not predict or assume any field value. Do not consider and strike through texts. here is the json:```{reverse_json}```. Do not make any web search or borrow any information from anywhere, just fix the json strictly following the image. Return the response in same json format with all the attributes.
"""
    pyperclip.copy(prompt)
    time.sleep(0.5)
    prompt_ss = "images/gemini/prompt_input.png"
    if(find(prompt_ss)):
        print("Found Place to write prompt")
        click_element(prompt_ss, confidence=0.8)
        pilot.hotkey('ctrl', 'v')
        print("Prompt pasted")
    time.sleep(2)
    print("Prompt Writing completed")
    return True

def handle_response():
    print("Waiting for response")
    successful = load_and_scroll_click("images/chatgpt/ok.png", duration=20)
    if successful:
        print("Received Response")
        copied_text=pyperclip.paste()
        return True
    else:
        return False