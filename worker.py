import threading
import time
import pyautogui as pilot

from checks.bsi import load_annotation
from checks.gemini import load_temp_chat, copy_image, paste_image, write_prompt, handle_response
from utils.executor import execute
from operations.copy_paste_image import copy_paste_image
from operations.submit_prompt import submit_prompt
from operations.submit_response import submit_response
from start import auto_start


class AutomationController:
    """
    Simple model:
      - START  → always begins a fresh run from the top.
      - PAUSE  → signals the running loop to stop ASAP.
      - RESUME → same as START (restart from the beginning).
    """

    def __init__(self):
        self._pause_event = threading.Event()
        self._pause_event.set()        # set = running, clear = paused
        self._stop_event = threading.Event()
        self._thread = None
        self._on_update = None

    # ---------- public API ----------
    def set_update_callback(self, cb):
        self._on_update = cb

    def _notify(self, state):
        if self._on_update:
            try:
                self._on_update(state)
            except Exception:
                pass

    def start(self):
        """Start a completely fresh run. Any existing thread is stopped first."""
        # Ask any old thread to die and wait briefly.
        if self._thread and self._thread.is_alive():
            self._stop_event.set()
            self._pause_event.set()          # unblock if paused
            self._thread.join(timeout=3)

        # Reset flags and spawn a new worker thread.
        self._stop_event.clear()
        self._pause_event.set()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        self._notify("running")

    def pause(self):
        self._pause_event.clear()
        self._notify("paused")

    def resume(self):
        # RESUME == START. We always restart from the beginning.
        self.start()

    def toggle_pause(self):
        if self._pause_event.is_set():
            self.pause()
        else:
            self.resume()

    def is_paused(self):
        return not self._pause_event.is_set()

    def is_running(self):
        return self._thread is not None and self._thread.is_alive() and self._pause_event.is_set()

    # ---------- internals ----------
    def _wait_if_paused(self):
        while not self._pause_event.wait(timeout=0.2):
            if self._stop_event.is_set():
                return False
        return not self._stop_event.is_set()

    def _interruptible_sleep(self, seconds):
        end = time.time() + seconds
        while time.time() < end:
            if self._stop_event.is_set():
                return False
            if not self._pause_event.is_set():
                if not self._wait_if_paused():
                    return False
            time.sleep(0.05)
        return True

    def _check_stop(self):
        """Return True if we should abort the current run."""
        return self._stop_event.is_set() or not self._pause_event.is_set()

    def _run(self):
        # Initial mouse positioning
        pilot.moveTo(921, 22, duration=0.5)
        pilot.click()

        while not self._stop_event.is_set():

            # Abort immediately if a pause/stop was requested
            if self._check_stop():
                break

            print("=== FRESH RUN FROM TOP ===")
            if not self._interruptible_sleep(1):
                break

            try:
                load_temp_chat()
                if self._check_stop(): break

                write_prompt()
                if self._check_stop(): break

                image_found = copy_image()
                if not image_found:
                    self._notify("done")
                    return
                if self._check_stop(): break

                paste_image()
                if self._check_stop(): break

                start_time = time.time()
                print("1. handling response")
                response_handled = handle_response()
                print("2. response handled")
                elapsed_time = time.time() - start_time

                if self._check_stop(): break

                if response_handled and elapsed_time <= 60:
                    print("3. submit response")
                    submit_response()
                else:
                    pilot.hotkey("ctrl", "1")
                    time.sleep(0.3)
                    pilot.hotkey("ctrl", "r")
                    time.sleep(0.3)
                    pilot.hotkey("ctrl", "2")
                    time.sleep(0.3)
                    pilot.hotkey("ctrl", "r")
                    if not self._interruptible_sleep(5):
                        break

            except Exception as e:
                print(f"[worker] error: {e}")
                if not self._interruptible_sleep(2):
                    break

        # Loop exit
        self._notify("done")


# Singleton used by the UI
controller = AutomationController()