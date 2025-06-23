# Football Manager API Documentation

## Tổng quan

Dự án Football Manager đã được tái cấu trúc với kiến trúc Controller-Service rõ ràng, tách biệt giữa API cho testing (Postman) và Web views (EJS).

## Cấu trúc dự án

```
src/
├── controllers/
│   ├── api/                    # API Controllers cho Postman testing
│   │   ├── authAPIController.js
│   │   ├── playerAPIController.js
│   │   ├── adminAPIController.js
│   │   └── accountAPIController.js
│   ├── authController.js       # Web Controllers cho EJS views
│   ├── playerController.js
│   ├── adminController.js
│   └── profileController.js
├── services/                   # Business logic layer
│   ├── authService.js
│   ├── playerService.js
│   ├── adminService.js
│   └── accountService.js
├── middleware/
│   ├── auth.js                 # Web authentication
│   └── authAPI.js              # API authentication
├── route/
│   ├── web.js                  # Web routes cho EJS
│   └── api.js                  # API routes cho testing
└── views/                      # EJS templates với UI mới
```

## Base URL

```
http://localhost:8080
```

## Authentication

API sử dụng JWT token để xác thực. Token có thể được gửi qua:

- Header: `Authorization: Bearer <token>`
- Cookie: `token=<token>` (tự động set khi login qua web)

## API Endpoints

### 🔐 Authentication APIs

#### 1. Register

- **POST** `/api/auth/register`
- **Body:**

```json
{
  "membername": "johndoe",
  "password": "password123",
  "name": "John Doe",
  "YOB": 1990
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "user_id",
    "membername": "johndoe",
    "name": "John Doe",
    "YOB": 1990,
    "isAdmin": false
  }
}
```

#### 2. Login

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "membername": "johndoe",
  "password": "password123"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "membername": "johndoe",
      "name": "John Doe",
      "YOB": 1990,
      "isAdmin": false
    }
  }
}
```

#### 3. Get Current User

- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "membername": "johndoe",
    "name": "John Doe",
    "YOB": 1990,
    "isAdmin": false
  }
}
```

#### 4. Logout

- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### ⚽ Player APIs

#### 1. Get All Players

- **GET** `/api/players`
- **Query Parameters:**
  - `page` (number): Trang hiện tại (default: 1)
  - `limit` (number): Số item per page (default: 10)
  - `team` (string): Filter theo team ID
  - `search` (string): Tìm kiếm theo tên
- **Response:**

```json
{
  "success": true,
  "data": {
    "players": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPlayers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 2. Get Player by ID

- **GET** `/api/players/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "player_id",
    "playerName": "Messi",
    "image": "image_url",
    "cost": 100000000,
    "isCaptain": true,
    "infomation": "Player description",
    "team": {
      "_id": "team_id",
      "teamName": "Barcelona"
    },
    "comments": [...]
  }
}
```

#### 3. Add Comment to Player (🔒 Auth Required)

- **POST** `/api/players/:id/comments`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "content": "Great player!"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "author": "user_id",
    "content": "Great player!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Delete Comment (🔒 Auth Required)

- **DELETE** `/api/players/:playerId/comments/:commentId`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### 👤 Account Management APIs (🔒 Admin Required)

#### 1. Get All Accounts

- **GET** `/api/accounts`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:**
  - `page`, `limit`, `search`, `isAdmin`
- **Response:**

```json
{
  "success": true,
  "data": {
    "accounts": [...],
    "pagination": {...}
  }
}
```

#### 2. Get Account Stats

- **GET** `/api/accounts/stats`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**

```json
{
  "success": true,
  "data": {
    "totalAccounts": 100,
    "totalAdmins": 5,
    "totalUsers": 95,
    "newAccountsLast30Days": 10
  }
}
```

#### 3. Update Account

- **PUT** `/api/accounts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "name": "New Name",
  "YOB": 1995
}
```

#### 4. Toggle Admin Status (🔒 Admin Only)

- **PATCH** `/api/accounts/:id/toggle-admin`
- **Headers:** `Authorization: Bearer <admin_token>`

#### 5. Change Password

- **PATCH** `/api/accounts/:id/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "currentPassword": "old_password", // Chỉ cần khi user tự đổi
  "newPassword": "new_password"
}
```

#### 6. Delete Account (🔒 Admin Only)

- **DELETE** `/api/accounts/:id`
- **Headers:** `Authorization: Bearer <admin_token>`

### 🛡️ Admin APIs (🔒 Admin Required)

#### 1. Dashboard Stats

- **GET** `/api/admin/dashboard`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 100,
      "totalAdmins": 5,
      "totalPlayers": 50,
      "totalTeams": 10,
      "newUsers": 5,
      "newPlayers": 3
    },
    "recentUsers": [...],
    "recentPlayers": [...]
  }
}
```

#### 2. Team Management

- **GET** `/api/admin/teams` - Get all teams
- **POST** `/api/admin/teams` - Create team
- **PUT** `/api/admin/teams/:id` - Update team
- **DELETE** `/api/admin/teams/:id` - Delete team

#### 3. Player Management

- **GET** `/api/admin/players` - Get all players (admin view)
- **POST** `/api/admin/players` - Create player
- **PUT** `/api/admin/players/:id` - Update player
- **DELETE** `/api/admin/players/:id` - Delete player

## Postman Testing Guide

### 1. Setup Environment

Tạo environment trong Postman với variables:

```
base_url: http://localhost:8080
token: {{token}}
```

### 2. Authentication Flow

1. **Register** một user mới
2. **Login** để lấy token
3. Set token vào environment variable
4. Sử dụng `{{token}}` trong Authorization header

### 3. Admin Testing

1. Tạo admin user thông qua database hoặc promote user thành admin
2. Login với admin account
3. Test các admin endpoints

### 4. Error Handling

Tất cả API đều trả về format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin required)
- `404` - Not Found
- `500` - Internal Server Error

## Sample Postman Collection

```json
{
  "info": {
    "name": "Football Manager API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"membername\": \"testuser\",\n  \"password\": \"password123\",\n  \"name\": \"Test User\",\n  \"YOB\": 1990\n}"
            },
            "url": "{{base_url}}/api/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"membername\": \"testuser\",\n  \"password\": \"password123\"\n}"
            },
            "url": "{{base_url}}/api/auth/login"
          }
        }
      ]
    },
    {
      "name": "Players",
      "item": [
        {
          "name": "Get All Players",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/players?page=1&limit=10"
          }
        }
      ]
    }
  ]
}
```

## Web Interface

Để truy cập giao diện web:

- Trang chủ: `http://localhost:8080/`
- Admin Dashboard: `http://localhost:8080/admin/dashboard`
- Quản lý tài khoản: `http://localhost:8080/admin/accounts`

## Khởi chạy dự án

```bash
npm start
```

Server sẽ chạy trên port 8080.
