# Canteen Menu System - Implementation Guide

## Overview
This menu system allows each canteen to have a customizable menu with items that have unique reference numbers. Users can browse menus, and admins can manage menu items.

## Files Created

### 1. **Model: [models/Menu.js](models/Menu.js)**
- Stores menu items for each canteen
- Auto-generates unique reference numbers (format: `CC-YYYYMMDD-XXX`)
- Fields include:
  - `refNumber`: Unique identifier (e.g., `MA-20260411-001`)
  - `canteen`: Which canteen this item belongs to
  - `name`: Item name
  - `description`: Description
  - `category`: main, vegetarian, vegan, beverage, snack, dessert
  - `price`: Item price
  - `preparationTime`: Time in minutes
  - `image`: Item image URL
  - `isAvailable`: Availability status
  - `spicyLevel`: mild, medium, spicy, none
  - `dietary`: Array of dietary tags
  - `quantity`: Stock quantity
  - `createdBy`/`updatedBy`: Admin who created/updated
  - `timestamps`: Created and updated dates

### 2. **Controller: [controllers/Canteen/menuController.js](controllers/Canteen/menuController.js)**
Functions available:
- **addMenuItem()** - Add new menu item (auto-generates ref number)
- **getMenuByCanteen()** - Get all items for a specific canteen
- **getAllMenuItems()** - Admin view of all items with filters
- **getMenuItemByRef()** - Get specific item by reference number
- **updateMenuItem()** - Edit existing menu item
- **deleteMenuItem()** - Remove menu item
- **toggleMenuItemAvailability()** - Mark as available/unavailable
- **getMenuStatistics()** - Get menu analytics

### 3. **Routes: [routes/Canteen/menuRoutes.js](routes/Canteen/menuRoutes.js)**

#### Public Endpoints (No Auth Required):
```
GET  /canteen/:canteen                    - Get full menu for a canteen
GET  /ref/:refNumber                      - Get specific item by ref number
```

#### Admin Endpoints (Requires Admin Auth):
```
GET  /                                    - Get all menu items with filters
GET  /stats/overview                      - Get menu statistics
POST /                                    - Add new menu item
PUT  /:id                                 - Update menu item
DELETE /:id                               - Delete menu item
PATCH /:id/toggle-availability            - Toggle item availability
```

## Integration Steps

1. **Add the import to your server.js:**
   ```javascript
   import menuRoutes from "./routes/Canteen/menuRoutes.js";
   ```

2. **Add the route to your server.js (after other Canteen routes):**
   ```javascript
   app.use("/api/menu", menuRoutes);
   ```

## API Usage Examples

### 1. Add Menu Item (Admin)
```bash
POST /api/menu
Headers: Authorization: Bearer <token>
Body: {
  "canteen": "Main Canteen",
  "name": "Biryani",
  "description": "Fragrant rice with chicken",
  "category": "main",
  "price": 150,
  "preparationTime": 20,
  "spicyLevel": "medium",
  "dietary": ["vegetarian"],
  "quantity": 50
}

Response:
{
  "success": true,
  "message": "Menu item added successfully",
  "data": {
    "refNumber": "MA-20260411-001",
    "canteen": "Main Canteen",
    "name": "Biryani",
    ...
  }
}
```

### 2. Get Menu by Canteen (Public)
```bash
GET /api/menu/canteen/Main Canteen?isAvailable=true&category=main
```

### 3. Get Item by Reference Number (Public)
```bash
GET /api/menu/ref/MA-20260411-001
```

### 4. Update Menu Item (Admin)
```bash
PUT /api/menu/<menuItemId>
Headers: Authorization: Bearer <token>
Body: {
  "price": 175,
  "isAvailable": false
}
```

### 5. Toggle Availability (Admin)
```bash
PATCH /api/menu/<menuItemId>/toggle-availability
Headers: Authorization: Bearer <token>
```

### 6. Get Menu Statistics (Admin)
```bash
GET /api/menu/stats/overview?canteen=Main Canteen
Response: {
  "success": true,
  "data": [{
    "canteen": "Main Canteen",
    "totalItems": 25,
    "availableItems": 23,
    "totalCategories": 5,
    "avgPrice": 125.50,
    "minPrice": 50,
    "maxPrice": 300
  }]
}
```

## Reference Number Format
Format: `CC-YYYYMMDD-XXX`
- `CC`: First 2 letters of canteen name (MA for Main Canteen, JU for Juice Bar)
- `YYYYMMDD`: Date item was added
- `XXX`: Sequential number (001, 002, etc. per day per canteen)

Example: `MA-20260411-001` = Main Canteen, April 11 2026, 1st item

## Canteen Names (Fixed Values)
- Main Canteen
- Juice Bar
- New canteen
- Anohana canteen

## Menu Categories Available
- main
- vegetarian
- vegan
- beverage
- snack
- dessert

## Dietary Tags Available
- gluten-free
- dairy-free
- nut-free
- vegan
- vegetarian

## Features

✅ Unique reference numbers for each item
✅ Per-canteen menu management
✅ Admin panel for adding/editing/deleting items
✅ Availability toggle
✅ Menu statistics and analytics
✅ Category and dietary filtering
✅ Image support
✅ Stock tracking
✅ Audit trail (createdBy/updatedBy)
✅ Preparation time tracking

## Security
- Public endpoints for browsing menus (no auth required)
- Admin endpoints protected by `requireAdmin` middleware
- Automatic audit trail with user tracking
