console.log("ChatGPT watcher loaded");

let intervalId = null;
let triggered = false;

function isValidJSON(text) {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null;
  } catch (e) {
    console.log("JSON parse error:", e);
    console.log("Full text:", text);
    return false;
  }
}

var gemini_code_count = 0


function checkParagraph() {
  // Stop if already handled
  if (triggered) return;

  if (!window.location.href.includes("chatgpt.com") && !window.location.href.includes("https://gemini.google.com/app?hl=en-IN")) {
    console.log("Not gemini or chatgpt")
    console.log(window.location.href)
    //return;
  }

  var last_one = ""
  // For Gemini part
  if (window.location.href.includes("gemini.google.com")) {
    // Use MutationObserver instead of interval polling
    const observer = new MutationObserver((mutations) => {
      // Get ALL code containers
      const codeContainers = document.querySelectorAll(".code-container");
      const icon= document.querySelector("gb_Md")
      if(icon!=undefined || icon!=null){
        icon.style.display="none"
      }
      // Check each code container for JSON
      codeContainers.forEach((container) => {
        // Try to find the actual code element inside
        const codeElement = container.querySelector('code') || container;
        const text = codeElement.innerText.trim();

        if (text !== "" && isValidJSON(text)) {
          // Check if this specific code block was already processed
          // Using a unique identifier - you can use container itself or create an ID
          if (!container.hasAttribute('data-json-processed')) {
            // Mark as processed immediately to prevent multiple alerts
            container.setAttribute('data-json-processed', 'true');
            if (last_one != text) {
              last_one = text
              alert("Valid JSON detected:\n" + text);
              navigator.clipboard.writeText(text)
                .then(() => {
                  console.log("JSON copied to clipboard");
                  // Optional: you can still have reload if needed
                  // window.location.reload();
                })
                .catch(err => console.error("Failed to copy:", err));
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer to clean up later if needed
    window.geminiObserver = observer;
  }

  if (window.location.href.includes("chatgpt.com")) {
    //const codes = document.querySelectorAll("code");
    const codes = document.getElementById("code-block-viewer") || document.getElementsByClassName("whitespace-pre!")[0]
    if (codes.length === 0) return;
    const text = codes.innerText.trim();

    if (text !== "" && isValidJSON(text)) {
      triggered = true;

      // stop the interval immediately
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      alert("Valid JSON detected:\n" + text);

      navigator.clipboard.writeText(text)
        .then(() => {
          console.log("JSON copied to clipboard");
          window.location.reload();
        })
        .catch(err => console.error("Failed to copy:", err));
    }
  }
}

// start polling
intervalId = setInterval(checkParagraph, 1000);