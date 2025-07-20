const { test, expect } = require('@playwright/test');

test.describe('Lead Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Navigate to Lead Creation
    await page.getByRole('button', { name: 'Lead Creation' }).click();
    
    // Verify we're on the Lead Creation page
    await expect(page.getByRole('heading', { name: 'Create New Lead' })).toBeVisible();
  });

  test('should create a new lead successfully', async ({ page }) => {
    // Set up dialog handler before triggering the action
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Lead created successfully!');
      await dialog.accept();
    });

    // Fill out the form with valid data
    await page.getByRole('textbox', { name: 'Customer Name *' }).fill('John Doe Industries');
    await page.getByRole('textbox', { name: 'Phone Number *' }).fill('9876543210');
    await page.getByLabel('Product Interest *').selectOption('Electronics');
    await page.getByLabel('Lead Source *').selectOption('Website');
    await page.getByRole('textbox', { name: 'Notes' }).fill('Interested in bulk electronics procurement for Q1 2024');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Lead' }).click();
    
    // Wait a moment for form processing
    await page.waitForTimeout(1000);
    
    // Verify form was reset after successful submission
    await expect(page.getByRole('textbox', { name: 'Customer Name *' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Phone Number *' })).toHaveValue('');
    await expect(page.getByLabel('Product Interest *')).toHaveValue('');
    await expect(page.getByLabel('Lead Source *')).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Notes' })).toHaveValue('');
  });

  test('should reset form when Reset button is clicked', async ({ page }) => {
    // Fill out some form data
    await page.getByRole('textbox', { name: 'Customer Name *' }).fill('Test Customer');
    await page.getByRole('textbox', { name: 'Phone Number *' }).fill('1234567890');
    await page.getByLabel('Product Interest *').selectOption('Electronics');
    
    // Click Reset button
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Verify form is cleared
    await expect(page.getByRole('textbox', { name: 'Customer Name *' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Phone Number *' })).toHaveValue('');
    await expect(page.getByLabel('Product Interest *')).toHaveValue('');
    await expect(page.getByLabel('Lead Source *')).toHaveValue('');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit form without filling required fields
    await page.getByRole('button', { name: 'Create Lead' }).click();
    
    // Check if form validation prevents submission
    // Note: Specific validation behavior depends on your implementation
    // You may need to adjust these assertions based on your validation messages
    await expect(page.getByRole('textbox', { name: 'Customer Name *' })).toBeFocused();
  });

  test('should accept valid phone numbers', async ({ page }) => {
    const phoneNumbers = [
      '9876543210',
      '+919876543210',
      '91-9876543210',
      '(98) 7654-3210'
    ];

    // Set up dialog handler once for all iterations
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    for (const phone of phoneNumbers) {
      // Clear and fill phone number
      await page.getByRole('textbox', { name: 'Phone Number *' }).clear();
      await page.getByRole('textbox', { name: 'Phone Number *' }).fill(phone);
      
      // Fill other required fields
      await page.getByRole('textbox', { name: 'Customer Name *' }).fill('Test Customer');
      await page.getByLabel('Product Interest *').selectOption('Electronics');
      await page.getByLabel('Lead Source *').selectOption('Website');
      
      // Submit form
      await page.getByRole('button', { name: 'Create Lead' }).click();
      
      // Wait a moment for form reset
      await page.waitForTimeout(1000);
    }
  });

  test('should have all required form elements', async ({ page }) => {
    // Verify all form elements are present
    await expect(page.getByRole('textbox', { name: 'Customer Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Phone Number *' })).toBeVisible();
    await expect(page.getByLabel('Product Interest *')).toBeVisible();
    await expect(page.getByLabel('Lead Source *')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Lead' })).toBeVisible();
  });

  test('should have correct dropdown options', async ({ page }) => {
    // Check Product Interest options
    const productOptions = ['Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Books & Media', 'Automotive', 'Health & Beauty', 'Toys & Games'];
    
    for (const option of productOptions) {
      await expect(page.getByLabel('Product Interest *').locator(`option:has-text("${option}")`)).toBeAttached();
    }
    
    // Check Lead Source options
    const sourceOptions = ['Website', 'Social Media', 'Referral', 'Cold Call', 'Email Campaign', 'Trade Show', 'Advertising', 'Other'];
    
    for (const option of sourceOptions) {
      await expect(page.getByLabel('Lead Source *').locator(`option:has-text("${option}")`)).toBeAttached();
    }
  });
});