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
    """
    pilot.hotkey("ctrl","1")
    click_element("images/gemini/reverse.png",confidence=0.8)
    time.sleep(1)
    pilot.hotkey("enter")
    #reverse_json=pyperclip.paste()
    """
    import random
    statements=["No web search. Your response should have copiable json.","Do not do web search. Respond in json format","Your response should be in copiable json format","Response in copiable json without any web search."]
    prompt='''You are a taxonomist who can understand herbarium sheet image, extract the values present in it and response in json format.
    Analyse the attached herbarium sheet image and fill the json : ```json{"scientific_name":"","scientific_name_confidence_score":0.0,"collector_name":"","collector_name_confidence_score":0.0,"locality":"","locality_confidence_score":0.0,"state":"","state_confidence_score":0.0,"country_name":"","country_name_confidence_score":0.0}```. 
    Constraints:
    - Only fill the if it is present in the image, else leave it blank. Collector name mostly has prefix "Leg.","Com.","Coll." and not "Herb.".
    - Only fill the locality if it is present in the sheet.
    - Put state and country if it is available in the sheet, else predict it from the locality value if locality value is present, else leave the field blank.
    - Mostly district or state can be found from label with prefix "Flora of XXX" if it is present.
    - Do not consider text - "Botanical Survey of India", it is generic sticker present.
    - Confidence score is a value <1, indicating the confidence of extracted/predicted values, some texts are handwritten hard to determine.
    '''+random.choice(statements)
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