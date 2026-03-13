import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from playwright.sync_api import sync_playwright

def get_first(locator):
    if locator.count() > 0:
        return locator.first
    return None

def safe_text(text):
    if text:
        return text[:80]
    return ''

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    
    console_errors = []
    page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda err: console_errors.append(f"[PAGE ERROR] {err}"))
    
    print("=" * 70)
    print("DETAILED UI/UX ANALYSIS: BuildMaster Pro")
    print("=" * 70)
    
    # Login first
    print("\n>>> Logging in...")
    page.goto('http://localhost:5174/login', timeout=60000, wait_until="networkidle")
    page.wait_for_timeout(3000)
    
    username = get_first(page.locator('input[name="username"]'))
    password = get_first(page.locator('input[name="password"]'))
    submit = get_first(page.locator('button[type="submit"]'))
    
    if username and password and submit:
        username.fill('admin')
        password.fill('admin123')
        submit.click()
        page.wait_for_timeout(3000)
    
    print(f"Logged in. URL: {page.url}")
    
    # ===== 1. HOME PAGE =====
    print("\n" + "=" * 70)
    print("[1] HOME PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/home', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/01_home.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    # Navigation
    nav_links = page.locator('nav a, [class*="sidebar"] a').all()
    print(f"Navigation items: {len(nav_links)}")
    for i, link in enumerate(nav_links):
        text = safe_text(link.text_content().strip())
        href = link.get_attribute('href') or ''
        print(f"  {i+1}. {text} -> {href}")
    
    # Stats/Cards
    cards = page.locator('[class*="card"]').all()
    print(f"\nCards: {len(cards)}")
    
    # Check what's in cards
    for i, card in enumerate(cards[:6]):
        text = safe_text(card.text_content())
        print(f"  Card {i+1}: {text[:50]}")
    
    # Charts
    charts = page.locator('svg').all()
    print(f"\nSVG Charts: {len(charts)}")
    
    # Buttons
    buttons = page.locator('button').all()
    print(f"\nButtons: {len(buttons)}")
    for i, btn in enumerate(buttons):
        text = safe_text(btn.text_content().strip())
        if text:
            disabled = btn.is_disabled()
            print(f"  {i+1}. [{'x' if disabled else 'OK'}] {text}")
    
    # ===== 2. PROJECTS PAGE =====
    print("\n" + "=" * 70)
    print("[2] PROJECTS PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/projects', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/02_projects.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    # Search
    search = get_first(page.locator('input[placeholder*="بحث"], input[type="search"]'))
    print(f"Search field: {'OK' if search else 'MISSING'}")
    
    # Table - try different selectors
    table = get_first(page.locator('table'))
    print(f"Table (table tag): {'FOUND' if table else 'NOT FOUND'}")
    
    # Check for any data display
    rows = page.locator('[class*="row"], [class*="item"]').all()
    print(f"Row items: {len(rows)}")
    
    # Buttons
    proj_buttons = page.locator('button').all()
    print(f"\nButtons: {len(proj_buttons)}")
    for i, btn in enumerate(proj_buttons):
        text = safe_text(btn.text_content().strip())
        disabled = btn.is_disabled()
        if text:
            print(f"  {i+1}. [{'x' if disabled else 'OK'}] {text}")
    
    # Try clicking Add Project
    add_btn = None
    for btn in proj_buttons:
        text = btn.text_content() or ''
        if 'مشروع' in text or 'إضافة' in text:
            add_btn = btn
            break
    
    if add_btn:
        print("\n>>> Testing Add Project button...")
        try:
            add_btn.click()
            page.wait_for_timeout(2000)
            page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/02b_add_project.png', full_page=True)
            print("Add button clicked successfully")
            
            # Check for modal/form
            modals = page.locator('[role="dialog"], .modal, [class*="modal"]').all()
            print(f"Modals/dialogs found: {len(modals)}")
            
            # Form fields
            inputs = page.locator('input, select, textarea').all()
            print(f"Form fields visible: {len(inputs)}")
            
            for i, inp in enumerate(inputs[:10]):
                inp_type = inp.get_attribute('type') or 'select'
                name = inp.get_attribute('name') or ''
                placeholder = safe_text(inp.get_attribute('placeholder') or '')
                print(f"    {i+1}. {inp_type:12} name={name[:15]} placeholder={placeholder}")
        except Exception as e:
            print(f"Could not click add: {e}")
    
    # ===== 3. CONTRACTORS PAGE =====
    print("\n" + "=" * 70)
    print("[3] CONTRACTORS PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/contractors', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/03_contractors.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    table = get_first(page.locator('table'))
    print(f"Table: {'FOUND' if table else 'NOT FOUND'}")
    
    buttons = page.locator('button').all()
    print(f"Buttons: {len(buttons)}")
    for i, btn in enumerate(buttons):
        text = safe_text(btn.text_content().strip())
        if text:
            print(f"  {i+1}. {text}")
    
    # ===== 4. EXPENSES PAGE =====
    print("\n" + "=" * 70)
    print("[4] EXPENSES PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/expenses', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/04_expenses.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    table = get_first(page.locator('table'))
    print(f"Table: {'FOUND' if table else 'NOT FOUND'}")
    
    buttons = page.locator('button').all()
    print(f"Buttons: {len(buttons)}")
    
    # ===== 5. INVOICES PAGE =====
    print("\n" + "=" * 70)
    print("[5] INVOICES PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/invoices', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/05_invoices.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    table = get_first(page.locator('table'))
    print(f"Table: {'FOUND' if table else 'NOT FOUND'}")
    
    buttons = page.locator('button').all()
    print(f"Buttons: {len(buttons)}")
    
    # ===== 6. SALES PAGE =====
    print("\n" + "=" * 70)
    print("[6] SALES PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/sales', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/06_sales.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    buttons = page.locator('button').all()
    print(f"Buttons: {len(buttons)}")
    for i, btn in enumerate(buttons):
        text = safe_text(btn.text_content().strip())
        if text:
            print(f"  {i+1}. {text}")
    
    # ===== 7. SETTINGS PAGE =====
    print("\n" + "=" * 70)
    print("[7] SETTINGS PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/settings', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/07_settings.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    inputs = page.locator('input, select, textarea').all()
    print(f"Form fields: {len(inputs)}")
    
    for i, inp in enumerate(inputs):
        inp_type = inp.get_attribute('type') or 'select'
        name = inp.get_attribute('name') or ''
        placeholder = safe_text(inp.get_attribute('placeholder') or '')
        disabled = inp.is_disabled()
        print(f"  {i+1}. {inp_type:12} name={name[:15]:15} disabled={disabled}")
    
    # Test filling a field
    if inputs:
        try:
            inputs[0].fill('Test Company')
            print("\nForm input test: OK")
        except Exception as e:
            print(f"\nForm input test: FAILED - {e}")
    
    # Save button
    save_btn = get_first(page.locator('button[type="submit"]'))
    if save_btn:
        print("Save button test...")
        try:
            save_btn.click()
            page.wait_for_timeout(2000)
            page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/07b_after_save.png', full_page=True)
            print("Save button: WORKING")
        except Exception as e:
            print(f"Save button: FAILED - {e}")
    
    # ===== 8. ENGINEERING DOCS =====
    print("\n" + "=" * 70)
    print("[8] ENGINEERING DOCS PAGE ANALYSIS")
    print("=" * 70)
    
    page.goto('http://localhost:5174/engineering', wait_until="networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/08_engineering.png', full_page=True)
    
    print(f"URL: {page.url}")
    
    buttons = page.locator('button').all()
    print(f"Buttons: {len(buttons)}")
    
    # ===== 9. RESPONSIVE TEST =====
    print("\n" + "=" * 70)
    print("[9] RESPONSIVE TEST")
    print("=" * 70)
    
    # Tablet
    page.set_viewport_size({'width': 768, 'height': 1024})
    page.goto('http://localhost:5174/home', wait_until="networkidle")
    page.wait_for_timeout(2000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/09_tablet.png', full_page=True)
    print("Tablet (768x1024): OK")
    
    # Mobile
    page.set_viewport_size({'width': 375, 'height': 667})
    page.goto('http://localhost:5174/home', wait_until="networkidle")
    page.wait_for_timeout(2000)
    page.screenshot(path='c:/Users/hozai/OneDrive/Desktop/AYMAN.B/Ayman.App.V2/report/10_mobile.png', full_page=True)
    print("Mobile (375x667): OK")
    
    # ===== 10. CONSOLE ERRORS =====
    print("\n" + "=" * 70)
    print("[10] CONSOLE ERRORS")
    print("=" * 70)
    
    if console_errors:
        print(f"Found {len(console_errors)} errors:")
        for err in console_errors[:15]:
            print(f"  - {err[:100]}")
    else:
        print("No console errors!")
    
    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE!")
    print("=" * 70)
    
    browser.close()
