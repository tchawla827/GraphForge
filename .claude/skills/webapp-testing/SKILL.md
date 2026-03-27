---
name: "webapp-testing"
description: "Test web applications with Playwright. Verify frontend functionality, debug UI behavior, capture screenshots, manage server lifecycle, and automate browser interactions. Use when: testing web apps, debugging UI issues, automating browser tasks, capturing test evidence."
---

# Web Application Testing

Automated testing and debugging of web applications using Playwright with Python.

## Core Capabilities

- **Frontend Verification** — Test UI functionality and user interactions
- **Debugging** — Examine DOM structure, network activity, and browser logs
- **Screenshots** — Capture visual evidence of UI state
- **Server Management** — Coordinate backend and frontend services
- **Browser Automation** — Simulate user workflows and interactions

## Recommended Workflow

### 1. Reconnaissance

Before writing tests, explore the application:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Wait for network to stabilize
    page.wait_for_load_state("networkidle")

    # Take screenshot to see current state
    page.screenshot(path="app_state.png")

    # Examine DOM
    content = page.content()
    print(content)

    browser.close()
```

### 2. Identify Selectors

Find appropriate selectors from rendered output:

```python
# By role (preferred for accessibility)
page.get_by_role("button", name="Submit").click()

# By label
page.get_by_label("Email").fill("test@example.com")

# By placeholder
page.get_by_placeholder("Enter name").fill("John")

# By text
page.get_by_text("Click me").click()

# CSS selector (fallback)
page.locator("#main-button").click()
```

### 3. Execute Actions

Interact with the application:

```python
# Fill forms
page.get_by_label("Username").fill("user123")
page.get_by_label("Password").fill("secure_password")

# Click buttons
page.get_by_role("button", name="Login").click()

# Wait for navigation
page.wait_for_url("**/dashboard")

# Verify content
assert page.get_by_text("Welcome, user123").is_visible()

# Take screenshot of result
page.screenshot(path="logged_in.png")
```

## Server Management

### Single Server

Manage application server lifecycle:

```python
import subprocess
import time
from pathlib import Path

class TestServer:
    def __init__(self, command, port=3000, wait_time=3):
        self.command = command
        self.port = port
        self.wait_time = wait_time
        self.process = None

    def start(self):
        self.process = subprocess.Popen(
            self.command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(self.wait_time)  # Wait for startup

    def stop(self):
        if self.process:
            self.process.terminate()
            self.process.wait()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

# Usage
with TestServer("npm run dev") as server:
    # Run tests against running server
    test_application()
```

### Multiple Servers

Coordinate backend and frontend:

```python
class MultiServerTest:
    def __init__(self):
        self.servers = {}

    def start_server(self, name, command, port, wait_time=3):
        process = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, "PORT": str(port)}
        )
        time.sleep(wait_time)
        self.servers[name] = process

    def stop_all(self):
        for process in self.servers.values():
            process.terminate()
            process.wait()

    def run(self):
        try:
            self.start_server("backend", "npm run dev:api", 3001)
            self.start_server("frontend", "npm run dev", 3000)

            # Run tests
            test_application()
        finally:
            self.stop_all()

# Usage
test = MultiServerTest()
test.run()
```

## Common Testing Patterns

### Form Testing

```python
def test_contact_form(page):
    page.goto("http://localhost:3000/contact")
    page.wait_for_load_state("networkidle")

    # Fill form
    page.get_by_label("Name").fill("John Doe")
    page.get_by_label("Email").fill("john@example.com")
    page.get_by_label("Message").fill("Test message")

    # Submit
    page.get_by_role("button", name="Send").click()

    # Verify success
    assert page.get_by_text("Message sent successfully").is_visible()
    page.screenshot(path="form_success.png")
```

### Navigation Testing

```python
def test_navigation(page):
    page.goto("http://localhost:3000")

    # Click navigation link
    page.get_by_role("link", name="About").click()

    # Wait for navigation and verify
    page.wait_for_url("**/about")
    assert page.get_by_role("heading", name="About Us").is_visible()

    # Go back
    page.go_back()
    page.wait_for_url("http://localhost:3000/")
    assert page.get_by_heading("Home").is_visible()
```

### Network Activity Testing

```python
def test_api_call(page):
    # Start recording network requests
    with page.expect_response("**/api/users") as response_promise:
        page.get_by_role("button", name="Load Users").click()

    response = response_promise.value
    assert response.status == 200
    data = response.json()
    assert len(data['users']) > 0
```

### Screenshot Comparisons

```python
def test_visual_regression(page):
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")

    # Take screenshot
    page.screenshot(path="screenshots/homepage.png")

    # Compare with baseline (manual review)
    # In CI: compare against previous version
```

## Browser Debugging

### Console Logs

```python
def test_with_console_logs(page):
    logs = []

    # Capture console messages
    page.on("console", lambda msg: logs.append({
        "type": msg.type,
        "text": msg.text
    }))

    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")

    # Check for errors
    error_logs = [log for log in logs if log["type"] == "error"]
    assert len(error_logs) == 0, f"Console errors found: {error_logs}"

    print("All console logs:", logs)
```

### Network Monitoring

```python
def test_network_requests(page):
    requests = []

    # Capture all network requests
    page.on("request", lambda req: requests.append({
        "url": req.url,
        "method": req.method,
        "status": "pending"
    }))

    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")

    # Check request types
    api_calls = [r for r in requests if "/api/" in r["url"]]
    print(f"API calls made: {len(api_calls)}")

    # Verify no failed requests
    page.on("response", lambda res: print(f"{res.url}: {res.status}"))
```

### DOM Inspection

```python
def test_dom_structure(page):
    page.goto("http://localhost:3000")

    # Wait for dynamic content
    page.wait_for_load_state("networkidle")

    # Get HTML
    content = page.content()

    # Verify structure
    assert "<nav>" in content
    assert "<main>" in content

    # Count elements
    buttons = page.locator("button").count()
    print(f"Found {buttons} buttons")
```

## Critical Guidance

### ⚠️ Wait for Network Idle on Dynamic Apps

Always wait for JavaScript to finish executing before interacting:

```python
# ✅ Correct: wait for dynamic content
page.wait_for_load_state("networkidle")
element = page.get_by_role("button")

# ❌ Wrong: interact before JS loads
element = page.get_by_role("button")
page.wait_for_load_state("networkidle")
```

### ⚠️ Use Appropriate Wait Strategies

```python
# Wait for element to be visible
page.get_by_role("button").wait_for(state="visible")

# Wait for element to be clickable
page.get_by_role("button").wait_for(state="visible", timeout=5000)
element = page.get_by_role("button")
element.click()

# Wait for specific condition
page.wait_for_function("() => document.querySelectorAll('.loaded').length > 0")
```

### ⚠️ Handle Dialogs

```python
def test_dialog(page):
    # Handle alert dialog
    page.on("dialog", lambda dialog: dialog.accept())
    page.get_by_role("button", name="Delete").click()

    # Or respond to dialog
    def handle_dialog(dialog):
        assert dialog.type == "confirm"
        assert "Are you sure?" in dialog.message
        dialog.dismiss()

    page.on("dialog", handle_dialog)
```

## Script Usage

Use helper scripts with `--help` to understand capabilities:

```bash
python scripts/with_server.py --help
python scripts/test_automation.py --help
```

Scripts work as reliable black-box solutions—don't read source code, just invoke with help flags first.

## Example Test Suite

```python
import pytest
from playwright.sync_api import sync_playwright

@pytest.fixture
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()

def test_homepage_loads(browser):
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    assert page.title() != ""
    page.close()

def test_user_login(browser):
    page = browser.new_page()
    page.goto("http://localhost:3000/login")

    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Login").click()

    page.wait_for_url("**/dashboard")
    assert page.get_by_heading("Dashboard").is_visible()
    page.close()

def test_form_validation(browser):
    page = browser.new_page()
    page.goto("http://localhost:3000/contact")

    # Submit empty form
    page.get_by_role("button", name="Send").click()

    # Verify error messages
    assert page.get_by_text("Name is required").is_visible()
    assert page.get_by_text("Email is required").is_visible()
    page.close()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

## Common Issues

### Element Not Found

```python
# Wait for element to appear
try:
    page.get_by_role("button", name="Save").click(timeout=5000)
except:
    # Take screenshot for debugging
    page.screenshot(path="error.png")
    raise
```

### Network Timeout

```python
# Increase network timeout
page.wait_for_load_state("networkidle", timeout=30000)

# Or wait for specific endpoint
page.wait_for_response("**/api/data")
```

### Flaky Tests

```python
# Use explicit waits instead of sleep
import time
time.sleep(1)  # ❌ Bad

# Instead:
page.wait_for_load_state("networkidle")  # ✅ Good
page.wait_for_selector("selector")       # ✅ Good
```

---

**Source:** [Web Application Testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)
**License:** MIT
