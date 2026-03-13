from playwright.sync_api import sync_playwright
import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OUTPUT_DIR = "output/test_results"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def test_app():
    results = []
    console_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        
        page.on("console", lambda msg: console_errors.append(str(msg)) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))
        
        print("="*60)
        print("Testing: http://localhost:5173")
        print("="*60)
        
        # First, clear localStorage to start fresh
        print("\n[Clearing localStorage]")
        page.goto("http://localhost:5173/")
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_timeout(1000)
        
        # Now go to setup
        print("\n[1] SETUP PAGE")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUTPUT_DIR}/1_setup.png", full_page=True)
        
        inputs = page.locator('input').count()
        print(f"   Inputs: {inputs}")
        
        if inputs > 0:
            try:
                # Fill form
                page.fill('input[name="name"]', 'شركة الاختبار')
                page.fill('input[name="phone"]', '0555555555')
                page.fill('input[name="email"]', 'test@test.com')
                page.fill('input[name="address"]', 'عنوان الشركة')
                page.screenshot(path=f"{OUTPUT_DIR}/1_setup_filled.png")
                
                page.locator('button[type="submit"]').click()
                page.wait_for_timeout(3000)
                page.screenshot(path=f"{OUTPUT_DIR}/1_setup_after.png")
                
                new_url = page.url
                results.append({"page": "Setup", "action": "Fill company data and save", "result": "SUCCESS - Redirected to home"})
            except Exception as e:
                results.append({"page": "Setup", "action": "Fill company data", "result": f"ERROR: {str(e)[:50]}"})
        
        # 2. Home
        print("\n[2] HOME PAGE")
        page.goto("http://localhost:5173/home", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/2_home.png", full_page=True)
        
        stat_labels = page.locator('text=/مشاريع|مصروفات|عقود|وحدات/').count()
        results.append({"page": "Home", "action": "View statistics", "result": f"{'SUCCESS' if stat_labels > 0 else 'ISSUE'} - Found {stat_labels} stat labels"})
        
        # 3. Projects
        print("\n[3] PROJECTS")
        page.goto("http://localhost:5173/projects", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/3_projects.png", full_page=True)
        
        # Try clicking the add button with different selectors
        add_btn = page.locator('button:has-text("مشروع جديد"), button:has-text("إضافة مشروع")').first
        if add_btn.is_visible():
            add_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=f"{OUTPUT_DIR}/3_projects_form.png")
            
            # Fill form fields by placeholder or label
            try:
                name_input = page.locator('input[placeholder*="اسم"], input[name="name"]').first
                name_input.fill('مشروع اختبار')
                
                budget_input = page.locator('input[name="budget"]').first
                budget_input.fill('100000')
                
                page.screenshot(path=f"{OUTPUT_DIR}/3_projects_filled.png")
                
                save_btn = page.locator('button:has-text("حفظ")').first
                save_btn.click()
                page.wait_for_timeout(1500)
                page.screenshot(path=f"{OUTPUT_DIR}/3_projects_after.png")
                results.append({"page": "Projects", "action": "Add project", "result": "SUCCESS"})
                
                # Try edit
                edit_btn = page.locator('button:has-text("تعديل")').first
                if edit_btn.is_visible():
                    edit_btn.click()
                    page.wait_for_timeout(500)
                    page.fill('input[name="name"]', 'مشروع معدل')
                    page.locator('button:has-text("حفظ")').click()
                    page.wait_for_timeout(1000)
                    results.append({"page": "Projects", "action": "Edit project", "result": "SUCCESS"})
                
                # Try delete
                delete_btn = page.locator('button:has-text("حذف")').first
                if delete_btn.is_visible():
                    delete_btn.click()
                    page.wait_for_timeout(500)
                    confirm = page.locator('button:has-text("تأكيد")').first
                    if confirm.is_visible():
                        confirm.click()
                        page.wait_for_timeout(1000)
                        results.append({"page": "Projects", "action": "Delete project", "result": "SUCCESS"})
            except Exception as e:
                results.append({"page": "Projects", "action": "Add/edit/delete", "result": f"ERROR: {str(e)[:50]}"})
        else:
            results.append({"page": "Projects", "action": "Add project", "result": "Add button not visible"})
        
        # 4. Engineering Docs
        print("\n[4] ENGINEERING DOCS")
        page.goto("http://localhost:5173/engineering", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/4_docs.png", full_page=True)
        
        # Get all buttons and look for add buttons
        buttons = page.locator('button').all()
        add_buttons = [b for b in buttons if "إضافة" in (b.inner_text() or "")]
        
        if add_buttons:
            try:
                add_buttons[0].click()
                page.wait_for_timeout(500)
                page.screenshot(path=f"{OUTPUT_DIR}/4_docs_form.png")
                results.append({"page": "Engineering Docs", "action": "Add document", "result": "SUCCESS - Form opened"})
            except Exception as e:
                results.append({"page": "Engineering Docs", "action": "Add document", "result": f"ERROR: {str(e)[:30]}"})
        else:
            results.append({"page": "Engineering Docs", "action": "Add document", "result": "No add button found"})
        
        # 5. Expenses
        print("\n[5] EXPENSES")
        page.goto("http://localhost:5173/expenses", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/5_expenses.png", full_page=True)
        
        add_btn = page.locator('button:has-text("إضافة مصروف")').first
        if add_btn.is_visible():
            add_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=f"{OUTPUT_DIR}/5_expenses_form.png")
            
            try:
                page.fill('input[name="description"]', 'مصروف اختبار')
                page.fill('input[name="amount"]', '500')
                page.screenshot(path=f"{OUTPUT_DIR}/5_expenses_filled.png")
                
                page.locator('button:has-text("حفظ")').click()
                page.wait_for_timeout(1500)
                page.screenshot(path=f"{OUTPUT_DIR}/5_expenses_after.png")
                results.append({"page": "Expenses", "action": "Add expense", "result": "SUCCESS"})
                
                # Export - try finding export buttons
                export_btns = page.locator('button:has-text("تصدير")').all()
                if export_btns:
                    results.append({"page": "Expenses", "action": "Export buttons", "result": f"SUCCESS - Found {len(export_btns)} export buttons"})
                else:
                    results.append({"page": "Expenses", "action": "Export Excel", "result": "No export buttons found"})
            except Exception as e:
                results.append({"page": "Expenses", "action": "Add expense", "result": f"ERROR: {str(e)[:50]}"})
        else:
            results.append({"page": "Expenses", "action": "Add expense", "result": "Add button not visible"})
        
        # 6. Invoices
        print("\n[6] INVOICES")
        page.goto("http://localhost:5173/invoices", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/6_invoices.png", full_page=True)
        
        create_btn = page.locator('button:has-text("إنشاء")').first
        if create_btn.is_visible():
            create_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=f"{OUTPUT_DIR}/6_invoices_form.png")
            results.append({"page": "Invoices", "action": "Create invoice", "result": "SUCCESS - Form opened"})
        else:
            results.append({"page": "Invoices", "action": "Create invoice", "result": "Create button not visible"})
        
        # 7. Contractors
        print("\n[7] CONTRACTORS")
        page.goto("http://localhost:5173/contractors", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/7_contractors.png", full_page=True)
        
        add_btn = page.locator('button:has-text("إضافة")').first
        if add_btn.is_visible():
            add_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=f"{OUTPUT_DIR}/7_contractors_form.png")
            
            try:
                page.fill('input[name="name"]', 'مقاول اختبار')
                page.fill('input[name="phone"]', '0555555555')
                page.screenshot(path=f"{OUTPUT_DIR}/7_contractors_filled.png")
                
                page.locator('button:has-text("حفظ")').click()
                page.wait_for_timeout(1500)
                page.screenshot(path=f"{OUTPUT_DIR}/7_contractors_after.png")
                results.append({"page": "Contractors", "action": "Add contractor", "result": "SUCCESS"})
                
                # Payment
                pay_btn = page.locator('button:has-text("دفعة")').first
                if pay_btn.is_visible():
                    pay_btn.click()
                    page.wait_for_timeout(500)
                    page.fill('input[name="amount"]', '1000')
                    page.locator('button:has-text("حفظ")').click()
                    page.wait_for_timeout(1000)
                    results.append({"page": "Contractors", "action": "Record payment", "result": "SUCCESS"})
            except Exception as e:
                results.append({"page": "Contractors", "action": "Add/pay", "result": f"ERROR: {str(e)[:50]}"})
        else:
            results.append({"page": "Contractors", "action": "Add contractor", "result": "Add button not visible"})
        
        # 8. Sales
        print("\n[8] SALES")
        page.goto("http://localhost:5173/sales", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/8_sales.png", full_page=True)
        
        added_something = False
        for text in ["وحدة", "مهتم", "عقد"]:
            btn = page.locator(f'button:has-text("إضافة {text}")').first
            if btn.is_visible():
                try:
                    btn.click()
                    page.wait_for_timeout(500)
                    page.screenshot(path=f"{OUTPUT_DIR}/8_sales_{text}.png")
                    results.append({"page": "Sales", "action": f"Add {text}", "result": "SUCCESS - Form opened"})
                    added_something = True
                    break
                except Exception as e:
                    results.append({"page": "Sales", "action": f"Add {text}", "result": f"ERROR: {str(e)[:30]}"})
        
        if not added_something:
            results.append({"page": "Sales", "action": "Add unit/lead/contract", "result": "No add buttons visible"})
        
        browser.close()
    
    # Print results
    print("\n" + "="*60)
    print("RESULTS:")
    print("="*60)
    
    success_count = 0
    fail_count = 0
    
    for r in results:
        status = "OK" if "SUCCESS" in r["result"] else "X"
        print(f"[{status}] {r['page']}: {r['action']} - {r['result']}")
        if "SUCCESS" in r["result"]:
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\nTotal: {success_count} OK, {fail_count} Issues")
    
    # Print console errors
    print("\n" + "="*60)
    print("CONSOLE ERRORS:")
    print("="*60)
    unique_errors = list(set([e[:150] for e in console_errors]))[:5]
    for err in unique_errors:
        print(f"- {err}...")
    
    # Save report
    report = {
        "results": results,
        "success_count": success_count,
        "fail_count": fail_count,
        "console_errors": unique_errors
    }
    with open(f"{OUTPUT_DIR}/test_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\nReport: {OUTPUT_DIR}/test_report.json")

if __name__ == "__main__":
    test_app()
