# Postman API Collection - Menu System

## BASE URL
```
http://localhost:5000
```

---

## 1️⃣ ADD MENU ITEM (POST)

**Endpoint:** `POST /api/menu`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "canteen": "Main Canteen",
  "name": "Butter Chicken",
  "description": "Tender chicken in creamy tomato sauce",
  "category": "main",
  "price": 250,
  "preparationTime": 20,
  "spicyLevel": "medium",
  "dietary": ["vegetarian"],
  "quantity": 50,
  "image": "https://example.com/butter-chicken.jpg"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Menu item added successfully",
  "data": {
    "_id": "660f3a2b4c5d6e7f8g9h0i1j",
    "refNumber": "MA-20260411-001",
    "canteen": "Main Canteen",
    "name": "Butter Chicken",
    "description": "Tender chicken in creamy tomato sauce",
    "category": "main",
    "price": 250,
    "preparationTime": 20,
    "isAvailable": true,
    "spicyLevel": "medium",
    "dietary": ["vegetarian"],
    "quantity": 50,
    "image": "https://example.com/butter-chicken.jpg",
    "createdAt": "2026-04-11T10:30:00Z"
  }
}
```

---

## 2️⃣ GET ALL MENU ITEMS (ADMIN VIEW)

**Endpoint:** `GET /api/menu`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?canteen=Main Canteen&category=main&isAvailable=true
```

**Sample Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "660f3a2b4c5d6e7f8g9h0i1j",
      "refNumber": "MA-20260411-001",
      "canteen": "Main Canteen",
      "name": "Butter Chicken",
      "category": "main",
      "price": 250,
      "isAvailable": true,
      "preparationTime": 20,
      "spicyLevel": "medium",
      "dietary": ["vegetarian"],
      "quantity": 50,
      "createdBy": {
        "_id": "admin123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-04-11T10:30:00Z"
    },
    {
      "_id": "660f3a2b4c5d6e7f8g9h0i1k",
      "refNumber": "MA-20260411-002",
      "canteen": "Main Canteen",
      "name": "Paneer Tikka",
      "category": "main",
      "price": 200,
      "isAvailable": true,
      "preparationTime": 15,
      "spicyLevel": "mild",
      "dietary": ["vegetarian", "gluten-free"],
      "quantity": 40,
      "createdAt": "2026-04-11T10:35:00Z"
    }
  ]
}
```

---

## 3️⃣ GET MENU BY CANTEEN (PUBLIC)

**Endpoint:** `GET /api/menu/canteen/:canteen`

**URL:** 
```
GET /api/menu/canteen/Main%20Canteen
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?category=main&isAvailable=true
```

**Sample Response:**
```json
{
  "success": true,
  "count": 12,
  "canteen": "Main Canteen",
  "data": [
    {
      "_id": "660f3a2b4c5d6e7f8g9h0i1j",
      "refNumber": "MA-20260411-001",
      "canteen": "Main Canteen",
      "name": "Butter Chicken",
      "description": "Tender chicken in creamy tomato sauce",
      "category": "main",
      "price": 250,
      "isAvailable": true,
      "preparationTime": 20,
      "spicyLevel": "medium",
      "dietary": ["vegetarian"],
      "image": "https://example.com/butter-chicken.jpg"
    },
    {
      "_id": "660f3a2b4c5d6e7f8g9h0i1k",
      "refNumber": "MA-20260411-002",
      "canteen": "Main Canteen",
      "name": "Dal Makhani",
      "description": "Creamy lentil curry",
      "category": "vegetarian",
      "price": 150,
      "isAvailable": true,
      "preparationTime": 25,
      "spicyLevel": "mild",
      "dietary": ["vegan", "gluten-free"],
      "image": "https://example.com/dal-makhani.jpg"
    }
  ]
}
```

---

## 4️⃣ GET ITEM BY REFERENCE NUMBER (PUBLIC)

**Endpoint:** `GET /api/menu/ref/:refNumber`

**URL:**
```
GET /api/menu/ref/MA-20260411-001
```

**Headers:**
```
Content-Type: application/json
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "_id": "660f3a2b4c5d6e7f8g9h0i1j",
    "refNumber": "MA-20260411-001",
    "canteen": "Main Canteen",
    "name": "Butter Chicken",
    "description": "Tender chicken in creamy tomato sauce",
    "category": "main",
    "price": 250,
    "isAvailable": true,
    "preparationTime": 20,
    "image": "https://example.com/butter-chicken.jpg",
    "spicyLevel": "medium",
    "dietary": ["vegetarian"],
    "quantity": 50,
    "createdBy": {
      "_id": "admin123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2026-04-11T10:30:00Z",
    "updatedAt": "2026-04-11T10:30:00Z"
  }
}
```

---

## 5️⃣ UPDATE MENU ITEM (PUT)

**Endpoint:** `PUT /api/menu/:id`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**URL:**
```
PUT /api/menu/660f3a2b4c5d6e7f8g9h0i1j
```

**Body (JSON):**
```json
{
  "price": 280,
  "preparationTime": 25,
  "isAvailable": true,
  "quantity": 45
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "_id": "660f3a2b4c5d6e7f8g9h0i1j",
    "refNumber": "MA-20260411-001",
    "name": "Butter Chicken",
    "canteen": "Main Canteen",
    "price": 280,
    "preparationTime": 25,
    "isAvailable": true,
    "quantity": 45,
    "updatedAt": "2026-04-11T11:00:00Z"
  }
}
```

---

## 6️⃣ DELETE MENU ITEM (DELETE)

**Endpoint:** `DELETE /api/menu/:id`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**URL:**
```
DELETE /api/menu/660f3a2b4c5d6e7f8g9h0i1j
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully",
  "data": {
    "refNumber": "MA-20260411-001",
    "name": "Butter Chicken"
  }
}
```

---

## 7️⃣ TOGGLE AVAILABILITY (PATCH)

**Endpoint:** `PATCH /api/menu/:id/toggle-availability`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**URL:**
```
PATCH /api/menu/660f3a2b4c5d6e7f8g9h0i1j/toggle-availability
```

**Body:** (Empty)
```json
{}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Menu item is now unavailable",
  "data": {
    "_id": "660f3a2b4c5d6e7f8g9h0i1j",
    "refNumber": "MA-20260411-001",
    "name": "Butter Chicken",
    "isAvailable": false
  }
}
```

---

## 8️⃣ GET MENU STATISTICS (ADMIN)

**Endpoint:** `GET /api/menu/stats/overview`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?canteen=Main Canteen
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "canteen": "Main Canteen",
      "totalItems": 25,
      "availableItems": 23,
      "totalCategories": 5,
      "avgPrice": 185.5,
      "minPrice": 50,
      "maxPrice": 350
    },
    {
      "canteen": "Juice Bar",
      "totalItems": 12,
      "availableItems": 11,
      "totalCategories": 2,
      "avgPrice": 75.25,
      "minPrice": 40,
      "maxPrice": 120
    }
  ]
}
```

---

## 📋 CURL COMMANDS

### Add Item:
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canteen": "Main Canteen",
    "name": "Butter Chicken",
    "description": "Tender chicken in creamy tomato sauce",
    "category": "main",
    "price": 250,
    "preparationTime": 20,
    "spicyLevel": "medium",
    "dietary": ["vegetarian"],
    "quantity": 50
  }'
```

### Get All Items (Admin):
```bash
curl -X GET "http://localhost:5000/api/menu" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Menu by Canteen (Public):
```bash
curl -X GET "http://localhost:5000/api/menu/canteen/Main%20Canteen" \
  -H "Content-Type: application/json"
```

### Get Item by Ref Number (Public):
```bash
curl -X GET "http://localhost:5000/api/menu/ref/MA-20260411-001" \
  -H "Content-Type: application/json"
```

### Update Item:
```bash
curl -X PUT http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 280,
    "preparationTime": 25
  }'
```

### Delete Item:
```bash
curl -X DELETE http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Toggle Availability:
```bash
curl -X PATCH http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j/toggle-availability \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Statistics:
```bash
curl -X GET "http://localhost:5000/api/menu/stats/overview?canteen=Main%20Canteen" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ⚠️ IMPORTANT NOTES

1. **Replace `YOUR_ADMIN_TOKEN_HERE`** with your actual JWT token from login
2. **Public endpoints** (GET canteen, GET by ref) do NOT require authorization
3. **Admin endpoints** (POST, PUT, PATCH, DELETE, GET all) require admin token
4. **Canteen names must match exactly:**
   - Main Canteen
   - Juice Bar
   - New canteen
   - Anohana canteen

---

## 🔑 GETTING ADMIN TOKEN

1. Login first:
```bash
POST /user/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

2. Copy the token from response
3. Use it in Authorization header as: `Bearer TOKEN_HERE`

---

## 🧪 TEST DATA - MULTIPLE ITEMS

Add these items to test the system:

### Item 1 - Main Canteen:
```json
{
  "canteen": "Main Canteen",
  "name": "Chicken Biryani",
  "description": "Fragrant basmati rice with tender chicken",
  "category": "main",
  "price": 200,
  "preparationTime": 20,
  "spicyLevel": "medium",
  "dietary": [],
  "quantity": 60
}
```

### Item 2 - Main Canteen:
```json
{
  "canteen": "Main Canteen",
  "name": "Paneer Butter Masala",
  "description": "Creamy cottage cheese curry",
  "category": "vegetarian",
  "price": 180,
  "preparationTime": 15,
  "spicyLevel": "mild",
  "dietary": ["vegetarian", "gluten-free"],
  "quantity": 40
}
```

### Item 3 - Juice Bar:
```json
{
  "canteen": "Juice Bar",
  "name": "Mango Smoothie",
  "description": "Fresh mango with yogurt",
  "category": "beverage",
  "price": 80,
  "preparationTime": 5,
  "spicyLevel": "none",
  "dietary": ["vegan"],
  "quantity": 100
}
```

### Item 4 - Juice Bar:
```json
{
  "canteen": "Juice Bar",
  "name": "Orange Juice",
  "description": "Fresh squeezed orange juice",
  "category": "beverage",
  "price": 60,
  "preparationTime": 3,
  "spicyLevel": "none",
  "dietary": ["vegan", "gluten-free"],
  "quantity": 150
}
```

---

## 📊 POSTMAN COLLECTION JSON

To import this collection into Postman, use this JSON:

```json
{
  "info": {
    "name": "Smart Canteen Menu API",
    "description": "API collection for menu management system"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "YOUR_ADMIN_TOKEN_HERE",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "ADD MENU ITEM",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/menu",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"canteen\": \"Main Canteen\",\n  \"name\": \"Butter Chicken\",\n  \"description\": \"Tender chicken in creamy tomato sauce\",\n  \"category\": \"main\",\n  \"price\": 250,\n  \"preparationTime\": 20,\n  \"spicyLevel\": \"medium\",\n  \"dietary\": [\"vegetarian\"],\n  \"quantity\": 50\n}"
        }
      }
    },
    {
      "name": "GET ALL ITEMS (ADMIN)",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/menu",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    },
    {
      "name": "GET MENU BY CANTEEN",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/menu/canteen/Main%20Canteen",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    },
    {
      "name": "GET ITEM BY REF NUMBER",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/menu/ref/MA-20260411-001",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    },
    {
      "name": "UPDATE ITEM",
      "request": {
        "method": "PUT",
        "url": "http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"price\": 280,\n  \"preparationTime\": 25\n}"
        }
      }
    },
    {
      "name": "DELETE ITEM",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j"
      }
    },
    {
      "name": "TOGGLE AVAILABILITY",
      "request": {
        "method": "PATCH",
        "url": "http://localhost:5000/api/menu/660f3a2b4c5d6e7f8g9h0i1j/toggle-availability"
      }
    },
    {
      "name": "GET STATISTICS",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/menu/stats/overview"
      }
    }
  ]
}
```
