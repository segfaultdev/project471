# Bulk Import Guide

## How to Import Stores and Products from Excel

### Step 1: Download the Template

1. Log in to your vendor account
2. Go to **Dashboard** → Click **"Bulk Import"** from Quick Actions
3. Click the **"Download Excel Template"** button
4. An Excel file named `shoplinker_import_template.xlsx` will be downloaded

### Step 2: Fill in Your Data

The Excel file has **2 sheets**:

#### Sheet 1: Stores
Column headers (must match exactly):
- **Store Name** (Required) - Your store's name
- **Description** - Brief description of your store
- **Address** - Physical or business address
- **Phone** - Contact phone number
- **Email** - Contact email address
- **Slug** - URL-friendly name (auto-generated if left empty)

Example:
```
Store Name          | Description                      | Address           | Phone          | Email               | Slug
My Electronics Shop | Quality electronics at low price | 123 Main St, NYC  | +1234567890    | shop@example.com    | my-electronics-shop
```

#### Sheet 2: Products
Column headers (must match exactly):
- **Store Name** (Required) - Must match exactly with a store name from Sheet 1
- **Product Name** (Required) - Your product's name
- **Description** - Product description
- **Price** (Required) - Product price in numbers (e.g., 99.99)
- **Stock** (Required) - Available quantity (e.g., 50)
- **Category** - Product category
- **Weight** - Product weight in kg (optional)

Example:
```
Store Name          | Product Name  | Description           | Price  | Stock | Category    | Weight
My Electronics Shop | Gaming Mouse  | RGB gaming mouse      | 49.99  | 100   | Accessories | 0.3
My Electronics Shop | Keyboard      | Mechanical keyboard   | 129.99 | 50    | Accessories | 1.2
```

### Step 3: Upload and Import

1. Go back to the **Bulk Import** page
2. Click the upload area or drag your Excel file
3. **Preview** your data - check if everything looks correct
4. Click **"Start Import"** button
5. Wait for the import to complete
6. Review the results:
   - ✅ Green sections show successful imports
   - ❌ Red sections show any errors (with row numbers and reasons)

### Important Notes

✅ **Do's:**
- Keep the sheet names exactly as "Stores" and "Products"
- Keep column headers exactly as shown (case-sensitive)
- Make sure Store Name in Products sheet matches exactly with Stores sheet
- Use numeric values for Price, Stock, and Weight
- Save file as .xlsx or .xls format

❌ **Don'ts:**
- Don't rename the sheets
- Don't change or remove column headers
- Don't leave required fields empty (Store Name, Product Name, Price, Stock)
- Don't use special characters in Slug field

### Troubleshooting

**Error: "Store not found"**
- Make sure the Store Name in Products sheet matches exactly with the Store Name in Stores sheet
- Check for extra spaces or typos

**Error: "duplicate key value"**
- A store with this name or slug already exists
- Use a different store name or slug

**Error: "Price must be a number"**
- Remove currency symbols ($, €, etc.)
- Use decimal point for cents (99.99 not 99,99)

**Import is slow**
- Large files (1000+ rows) may take a few minutes
- Don't close the browser during import
- Wait for the completion message

### Tips for Best Results

1. **Start Small**: Test with 2-3 stores and 5-10 products first
2. **Check Data**: Review the preview before importing
3. **One Store at a Time**: For large datasets, import stores for one category at a time
4. **Backup**: Keep your original Excel file as backup

### Excel Template Structure

```
📁 shoplinker_import_template.xlsx
  📄 Sheet 1: Stores (Store information)
  📄 Sheet 2: Products (Product listings with store references)
```

### Need Help?

If you encounter issues:
1. Download a fresh template
2. Check column headers match exactly
3. Verify required fields are filled
4. Review error messages for specific row numbers
5. Contact support with the error details

---

**Pro Tip**: You can create your store data in Google Sheets or any spreadsheet software, then export as Excel (.xlsx) format before uploading!
