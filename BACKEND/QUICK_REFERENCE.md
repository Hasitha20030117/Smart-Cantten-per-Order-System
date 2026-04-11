# Menu System - Quick Reference

## ✅ What's Been Created

### Backend Files:
1. **Model** → `models/Menu.js`
   - Stores menu items with auto-generated reference numbers
   - Linked to specific canteens

2. **Controller** → `controllers/Canteen/menuController.js`
   - 8 functions for menu management
   - Auto-generates unique ref numbers (CC-YYYYMMDD-XXX format)

3. **Routes** → `routes/Canteen/menuRoutes.js`
   - Public endpoints for browsing
   - Admin endpoints for managing

4. **Server Integration** → `server.js`
   - Route imported and mounted at `/api/menu`

## 📌 Reference Number Format
Format: `CC-YYYYMMDD-XXX`

Examples:
- `MA-20260411-001` = Main Canteen, April 11 2026, Item #1
- `JU-20260411-002` = Juice Bar, April 11 2026, Item #2
- `NE-20260411-001` = New canteen, April 11 2026, Item #1
- `AN-20260411-001` = Anohana canteen, April 11 2026, Item #1

Generated automatically when adding items!

## 🔧 Using the Menu System

### For Admin/Canteen Manager:

**Add a new menu item:**
```
POST /api/menu
Body: {
  "canteen": "Main Canteen",
  "name": "Paneer Butter Masala",
  "description": "Cottage cheese in creamy tomato gravy",
  "category": "main",
  "price": 180,
  "preparationTime": 15,
  "spicyLevel": "medium",
  "dietary": ["vegetarian"],
  "quantity": 50
}
```

**Get all menu items:**
```
GET /api/menu
```

**Get statistics:**
```
GET /api/menu/stats/overview?canteen=Main Canteen
```

**Update a menu item:**
```
PUT /api/menu/<itemId>
Body: { 
  "price": 200,
  "preparationTime": 20 
}
```

**Toggle availability:**
```
PATCH /api/menu/<itemId>/toggle-availability
```

**Delete an item:**
```
DELETE /api/menu/<itemId>
```

### For Users/Customers:

**Browse full menu for a canteen:**
```
GET /api/menu/canteen/Main%20Canteen
```

**Get specific item by reference number:**
```
GET /api/menu/ref/MA-20260411-001
```

**Filter by category:**
```
GET /api/menu/canteen/Main%20Canteen?category=main&isAvailable=true
```

## 📊 Available Fields

### Menu Item Fields:
- `refNumber` - Auto-generated unique ID
- `canteen` - Which canteen (Main Canteen, Juice Bar, New canteen, Anohana canteen)
- `name` - Item name
- `description` - Description
- `category` - main, vegetarian, vegan, beverage, snack, dessert
- `price` - Price in rupees
- `preparationTime` - Minutes to prepare
- `image` - Image URL
- `isAvailable` - true/false
- `spicyLevel` - mild, medium, spicy, none
- `dietary` - Array: gluten-free, dairy-free, nut-free, vegan, vegetarian
- `quantity` - Stock quantity
- `createdBy` - Admin who created
- `updatedBy` - Admin who last updated
- `timestamps` - Created/updated dates

## 🔒 Security
- ✅ Public endpoints: Browse menus (no auth needed)
- ✅ Admin endpoints: Manage menus (admin auth required)
- ✅ Audit trail: Tracks who created/updated items

## 🧪 Testing the API

### 1. Add an item:
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canteen": "Main Canteen",
    "name": "Dosa",
    "category": "main",
    "price": 100,
    "description": "Crispy south Indian crepe"
  }'
```

### 2. Get menu for a canteen:
```bash
curl http://localhost:5000/api/menu/canteen/Main%20Canteen
```

### 3. Get item by ref number:
```bash
curl http://localhost:5000/api/menu/ref/MA-20260411-001
```

## ✨ Features Included

✅ Auto-generated unique reference numbers
✅ Per-canteen menu management
✅ Multiple categories and dietary options
✅ Stock/quantity tracking
✅ Image support
✅ Availability toggle
✅ Menu statistics
✅ Audit trail (who created/modified)
✅ Filtering by canteen, category, availability
✅ Admin panel ready
✅ Public browsing ready

## 🚀 Next Steps

1. Start your backend server
2. Test the API endpoints using Postman/curl
3. Integrate with your Frontend to:
   - Display menu in canteen landing page
   - Add admin panel for menu management
   - Show ref numbers in orders
   - Filter by category/dietary preferences
