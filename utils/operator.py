import pyautogui as pilot
from utils.cursors import get
from pyautogui import ImageNotFoundException
import time

def click_element(img_path,confidence=0.4):
    try:
        location=pilot.locateOnScreen(img_path,confidence=confidence)
        x,y=get(location)
        pilot.moveTo(x,y,duration=0.2)
        pilot.click()
        time.sleep(0.2)
        return True
    except ImageNotFoundException:
        return False

def double_click_element(img_path,confidence=0.4):
    try:
        location=pilot.locateOnScreen(img_path,confidence=confidence)
        x,y=get(location)
        pilot.moveTo(x,y,duration=0.2)
        pilot.doubleClick()
        time.sleep(0.2)
        return True
    except ImageNotFoundException:
        return False
