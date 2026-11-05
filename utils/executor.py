import time
import pyautogui as pilot
from pyautogui import ImageNotFoundException
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from pyautogui import ImageNotFoundException

import cv2
import numpy as np
from concurrent.futures import ThreadPoolExecutor


def _load_templates(paths, grayscale):
    flag = cv2.IMREAD_GRAYSCALE if grayscale else cv2.IMREAD_COLOR
    templates = []
    for p in paths:
        t = cv2.imread(p, flag)
        if t is None:
            raise FileNotFoundError(f"Could not read image: {p}")
        templates.append(t)
    return templates


def wait_for_first_image(image_paths, max_time_to_wait=5, confidence=0.8,
                         region=None, grayscale=True, poll_interval=0.02,
                         parallel=False, on_miss=None, debug=False):
    templates = _load_templates(image_paths, grayscale)
    conv = cv2.COLOR_RGB2GRAY if grayscale else cv2.COLOR_RGB2BGR

    def _match(tpl, screen):
        th, tw = tpl.shape[:2]
        sh, sw = screen.shape[:2]
        if th > sh or tw > sw:
            return False
        res = cv2.matchTemplate(screen, tpl, cv2.TM_CCOEFF_NORMED)
        return cv2.minMaxLoc(res)[1] >= confidence

    pool = ThreadPoolExecutor(max_workers=len(templates)) if parallel else None
    start = time.time()
    end = start + max_time_to_wait
    try:
        while True:
            t0 = time.time()
            screen = cv2.cvtColor(np.array(pilot.screenshot(region=region)), conv)  # once per loop
            t1 = time.time()

            if pool:
                results = list(pool.map(lambda t: _match(t, screen), templates))
            else:
                results = []
                for t in templates:
                    results.append(_match(t, screen))

            if debug:
                print(f"screenshot {t1-t0:.3f}s | match {time.time()-t1:.3f}s | {results}")

            for idx, found in enumerate(results):
                if found:
                    return idx

            if time.time() >= end:
                return None
            if on_miss:
                on_miss()
            time.sleep(poll_interval)
    finally:
        if pool:
            pool.shutdown()


def execute(func, params=None, duration=300, frequency=10):
    for i in range(duration*frequency):
        res=func()
        if res:
            print("Executed Successfully")
            return True
        time.sleep(1/frequency)
    return False

def is_element_present(path,duration=5,frequency=10,confidence=0.8):
    iterations = duration * frequency
    for _ in range(iterations):
        try:
            res = pilot.locateOnScreen(path, confidence=confidence)
            if res is not None:
                return True  # Found element
        except ImageNotFoundException:
            # If the file is missing, no point in retrying
            time.sleep(1 / frequency)
        time.sleep(1 / frequency)
    return False

from utils.operator import click_element
def load_and_click(path,duration=30,confidence=0.8):
    duration=duration*10
    for _ in range(duration):
        try:
            res = pilot.locateOnScreen(path, confidence=confidence)
            if res is not None:
                return click_element(path,confidence=confidence)
        except ImageNotFoundException:
            time.sleep(0.1)
        time.sleep(0.1)
    return False

def load_and_scroll_click(path,duration=30,confidence=0.8):
    duration=duration*10
    for _ in range(duration):
        try:
            res = pilot.locateOnScreen(path, confidence=confidence)
            if res is not None:
                return click_element(path,confidence=confidence)
            pilot.scroll(-200)
        except ImageNotFoundException:
            time.sleep(0.1)
        time.sleep(0.1)

