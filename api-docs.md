# Dokumentasi API Backend

Dokumentasi ini menjelaskan endpoint API yang tersedia pada backend Node.js untuk aplikasi e-commerce.

## Informasi Umum

- **Base URL**: `http://[BACKEND_IP]:8080`
- **Format Response**: JSON
- **Content-Type**: `application/json`

## Endpoints

### 1. Root Endpoint

#### GET /

Menampilkan pesan selamat datang untuk memastikan API berjalan.

**Response**:
```json
{
  "message": "Selamat datang di API Node.js"
}
```

### 2. Produk

#### GET /api/products

Mendapatkan daftar semua produk.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Smartphone",
    "description": "Smartphone terbaru dengan spesifikasi tinggi",
    "price": 799.99,
    "image_url": "https://via.placeholder.com/150?text=Smartphone",
    "stock": 50,
    "unit": "pcs"
  },
  {
    "id": 2,
    "name": "Laptop",
    "description": "Laptop untuk kebutuhan profesional",
    "price": 1299.99,
    "image_url": "https://via.placeholder.com/150?text=Laptop",
    "stock": 30,
    "unit": "pcs"
  }
]
```

#### GET /api/products/:id

Mendapatkan detail produk berdasarkan ID.

**Parameters**:
- `id` (path): ID produk

**Response**:
```json
{
  "id": 1,
  "name": "Smartphone",
  "description": "Smartphone terbaru dengan spesifikasi tinggi",
  "price": 799.99,
  "image_url": "https://via.placeholder.com/150?text=Smartphone",
  "stock": 50,
  "unit": "pcs"
}
```

#### POST /api/products

Membuat produk baru.

**Request Body**:
```json
{
  "name": "Tablet",
  "description": "Tablet untuk kebutuhan multimedia",
  "price": 399.99,
  "image_url": "https://via.placeholder.com/150?text=Tablet",
  "stock": 25,
  "unit": "pcs"
}
```

**Response**:
```json
{
  "id": 3,
  "name": "Tablet",
  "description": "Tablet untuk kebutuhan multimedia",
  "price": 399.99,
  "image_url": "https://via.placeholder.com/150?text=Tablet",
  "stock": 25,
  "unit": "pcs"
}
```

#### PUT /api/products/:id

Mengupdate produk yang sudah ada.

**Parameters**:
- `id` (path): ID produk

**Request Body**:
```json
{
  "name": "Tablet Pro",
  "price": 499.99,
  "stock": 20
}
```

**Response**:
```json
{
  "id": 3,
  "name": "Tablet Pro",
  "description": "Tablet untuk kebutuhan multimedia",
  "price": 499.99,
  "image_url": "https://via.placeholder.com/150?text=Tablet",
  "stock": 20,
  "unit": "pcs"
}
```

#### DELETE /api/products/:id

Menghapus produk.

**Parameters**:
- `id` (path): ID produk

**Response**:
```json
{
  "message": "Produk berhasil dihapus"
}
```

### 3. Keranjang Belanja

#### GET /api/cart/:userId

Mendapatkan isi keranjang belanja berdasarkan ID pengguna.

**Parameters**:
- `userId` (path): ID pengguna

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "name": "Smartphone",
    "price": 799.99,
    "image_url": "https://via.placeholder.com/150?text=Smartphone"
  },
  {
    "id": 2,
    "user_id": 1,
    "product_id": 2,
    "quantity": 1,
    "name": "Laptop",
    "price": 1299.99,
    "image_url": "https://via.placeholder.com/150?text=Laptop"
  }
]
```

#### POST /api/cart/add

Menambahkan produk ke keranjang belanja.

**Request Body**:
```json
{
  "userId": 1,
  "productId": 3,
  "quantity": 1
}
```

**Response**:
```json
{
  "id": 3,
  "user_id": 1,
  "product_id": 3,
  "quantity": 1
}
```

#### PUT /api/cart/update

Mengupdate jumlah produk di keranjang belanja.

**Request Body**:
```json
{
  "userId": 1,
  "productId": 3,
  "quantity": 2
}
```

**Response**:
```json
{
  "id": 3,
  "user_id": 1,
  "product_id": 3,
  "quantity": 2
}
```

#### DELETE /api/cart/:userId/:productId

Menghapus produk dari keranjang belanja.

**Parameters**:
- `userId` (path): ID pengguna
- `productId` (path): ID produk

**Response**:
```json
{
  "message": "Item berhasil dihapus dari keranjang"
}
```

#### DELETE /api/cart/clear/:userId

Mengosongkan keranjang belanja.

**Parameters**:
- `userId` (path): ID pengguna

**Response**:
```json
{
  "message": "Keranjang berhasil dikosongkan"
}
```

### 4. Pengguna

#### GET /api/users/:id

Mendapatkan informasi pengguna berdasarkan ID.

**Parameters**:
- `id` (path): ID pengguna

**Response**:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### POST /api/users

Membuat pengguna baru.

**Request Body**:
```json
{
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "id": 2,
  "username": "janedoe",
  "email": "jane@example.com"
}
```

## Kode Status

- `200 OK`: Permintaan berhasil
- `201 Created`: Resource berhasil dibuat
- `400 Bad Request`: Permintaan tidak valid (misalnya, data yang diperlukan tidak ada)
- `404 Not Found`: Resource tidak ditemukan
- `500 Internal Server Error`: Terjadi kesalahan pada server

## Contoh Penggunaan

### Mendapatkan Semua Produk

```javascript
fetch('http://[BACKEND_IP]:8080/api/products')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Menambahkan Item ke Keranjang

```javascript
fetch('http://[BACKEND_IP]:8080/api/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 1,
    productId: 1,
    quantity: 1
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```