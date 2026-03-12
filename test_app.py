from playwright.sync_api import sync_playwright
import os
import json
import sys

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def test_app():
    errors = []
    screenshots_dir = "output/playwright"
    os.makedirs(screenshots_dir, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err}"))
        
        print("=" * 60)
        print("Testing: http://localhost:5173")
        print("=" * 60)
        
        # Test Home Page
        print("\n[1] Testing Home Page...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.screenshot(path=f"{screenshots_dir}/1_home.png", full_page=True)
        
        # Check for critical errors on home
        critical_errors = [e for e in errors if "Error" in e or "exception" in e.lower()]
        if critical_errors:
            print(f"   [X] Errors found: {critical_errors}")
        else:
            print("   [OK] No errors")
        
        # Get page title
        title = page.title()
        print(f"   Page title: {title}")
        
        # Test navigation links
        nav_links = page.locator("a").all()
        print(f"   Found {len(nav_links)} links")
        
        # Try to find and click sidebar items
        sidebar_items = page.locator("nav, .sidebar, [class*='side'], ul li").all()
        print(f"   Found {len(sidebar_items)} nav items")
        
        # Test Projects page if exists
        print("\n[2] Testing Projects Page...")
        try:
            page.goto("http://localhost:5173/projects", wait_until="networkidle", timeout=10000)
            page.screenshot(path=f"{screenshots_dir}/2_projects.png", full_page=True)
            print("   [OK] Projects page loaded")
        except Exception as e:
            print(f"   [!] Projects page: {e}")
            errors.append(f"Projects page: {e}")
        
        # Test Expenses page if exists
        print("\n[3] Testing Expenses Page...")
        try:
            page.goto("http://localhost:5173/expenses", wait_until="networkidle", timeout=10000)
            page.screenshot(path=f"{screenshots_dir}/3_expenses.png", full_page=True)
            print("   [OK] Expenses page loaded")
        except Exception as e:
            print(f"   [!] Expenses page: {e}")
            errors.append(f"Expenses page: {e}")
        
        # Test Settings page if exists
        print("\n[4] Testing Settings Page...")
        try:
            page.goto("http://localhost:5173/settings", wait_until="networkidle", timeout=10000)
            page.screenshot(path=f"{screenshots_dir}/4_settings.png", full_page=True)
            print("   [OK] Settings page loaded")
        except Exception as e:
            print(f"   [!] Settings page: {e}")
            errors.append(f"Settings page: {e}")
        
        # Test Setup page if exists
        print("\n[5] Testing Setup Page...")
        try:
            page.goto("http://localhost:5173/setup", wait_until="networkidle", timeout=10000)
            page.screenshot(path=f"{screenshots_dir}/5_setup.png", full_page=True)
            print("   [OK] Setup page loaded")
        except Exception as e:
            print(f"   [!] Setup page: {e}")
            errors.append(f"Setup page: {e}")
        
        # Test Engineering Docs page if exists
        print("\n[6] Testing Engineering Docs Page...")
        try:
            page.goto("http://localhost:5173/engineering-docs", wait_until="networkidle", timeout=10000)
            page.screenshot(path=f"{screenshots_dir}/6_engineering_docs.png", full_page=True)
            print("   [OK] Engineering Docs page loaded")
        except Exception as e:
            print(f"   [!] Engineering Docs page: {e}")
            errors.append(f"Engineering Docs page: {e}")
        
        # Print console messages
        print("\n" + "=" * 60)
        print("CONSOLE MESSAGES:")
        print("=" * 60)
        for msg in console_messages[:20]:  # Show first 20 messages
            print(msg)
        if len(console_messages) > 20:
            print(f"... and {len(console_messages) - 20} more messages")
        
        # Print all errors
        print("\n" + "=" * 60)
        print("ALL ERRORS FOUND:")
        print("=" * 60)
        if errors:
            for err in errors:
                print(f"[X] {err}")
        else:
            print("[OK] No critical errors found!")
        
        browser.close()
        
        # Save report
        report = {
            "total_errors": len(errors),
            "errors": errors,
            "console_messages": console_messages,
            "pages_tested": ["home", "projects", "expenses", "settings", "setup", "engineering-docs"]
        }
        with open(f"{screenshots_dir}/test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n📁 Screenshots saved to: {screenshots_dir}/")
        print(f"📊 Report saved to: {screenshots_dir}/test_report.json")

if __name__ == "__main__":
    test_app()
