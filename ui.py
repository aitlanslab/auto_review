import tkinter as tk
from worker import controller


class FloatingControl(tk.Tk):
    STYLE = {
        "stopped": {"icon": "▶", "label": "Start",  "bg": "#2d7d46", "active": "#3aa55a", "fg": "white"},
        "running": {"icon": "❚❚", "label": "Pause", "bg": "#b3452a", "active": "#d4583a", "fg": "white"},
        "paused":  {"icon": "▶",  "label": "Start", "bg": "#2d7d46", "active": "#3aa55a", "fg": "white"},
        "done":    {"icon": "▶",  "label": "Start", "bg": "#2d7d46", "active": "#3aa55a", "fg": "white"},
    }

    def __init__(self):
        super().__init__()
        self.overrideredirect(True)
        self.attributes("-topmost", True)
        self.attributes("-alpha", 0.92)
        self.configure(bg="#1e1e1e")

        self.WIN_W = 160
        self.WIN_H = 52
        self.MARGIN = 20

        self._current_state = "stopped"

        self._build_ui()
        self._place_bottom_left()
        self._make_draggable()
        self._apply_style("stopped")

        controller.set_update_callback(self._on_update)

    # ---------- Positioning ----------
    def _place_bottom_left(self):
        self.update_idletasks()
        sh = self.winfo_screenheight()
        x = self.MARGIN
        y = sh - self.WIN_H - self.MARGIN - 60
        self.geometry(f"{self.WIN_W}x{self.WIN_H}+{x}+{y}")

    # ---------- UI ----------
    def _build_ui(self):
        container = tk.Frame(self, bg="#1e1e1e")
        container.pack(fill="both", expand=True, padx=6, pady=6)

        self.btn = tk.Button(
            container,
            text="▶ Start",
            font=("Segoe UI", 12, "bold"),
            bd=0, relief="flat",
            padx=14, pady=6,
            cursor="hand2",
            command=self._on_toggle,
        )
        self.btn.pack(fill="both", expand=True)

    def _make_draggable(self):
        self._drag_x = 0
        self._drag_y = 0
        for w in (self, self.btn):
            w.bind("<ButtonPress-1>", self._drag_start, add="+")
            w.bind("<B1-Motion>", self._drag_move, add="+")

    def _drag_start(self, e):
        self._drag_x = e.x
        self._drag_y = e.y

    def _drag_move(self, e):
        x = self.winfo_x() + e.x - self._drag_x
        y = self.winfo_y() + e.y - self._drag_y
        self.geometry(f"+{x}+{y}")

    # ---------- Button styling ----------
    def _apply_style(self, state):
        s = self.STYLE.get(state, self.STYLE["stopped"])
        self.btn.config(
            text=f'{s["icon"]}  {s["label"]}',
            bg=s["bg"], fg=s["fg"],
            activebackground=s["active"], activeforeground=s["fg"],
        )

    # ---------- Logic ----------
    def _on_toggle(self):
        # The button is a pure toggle: running → pause, anything else → start.
        if self._current_state == "running":
            controller.pause()
        else:
            controller.start()

    def _on_update(self, state):
        self.after(0, self._apply_update, state)

    def _apply_update(self, state):
        # We trust the state the worker sent. Do NOT auto-rewrite "paused"
        # to "done" when the thread dies — a paused worker is intentionally
        # not running.
        self._current_state = state
        self._apply_style(state)


if __name__ == "__main__":
    app = FloatingControl()
    app.mainloop()