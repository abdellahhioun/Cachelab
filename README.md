# CacheLab - Custom HashMap Implementation

A custom hash map implementation similar to Redis, storing data in RAM with disk persistence. Built with TypeScript and Express.

## 📚 Table of Contents

1. [What is a Hash Map?](#what-is-a-hash-map)
2. [How Our Implementation Works](#how-our-implementation-works)
3. [Step-by-Step Explanation](#step-by-step-explanation)
4. [Architecture Overview](#architecture-overview)
5. [API Endpoints](#api-endpoints)
6. [Installation & Usage](#installation--usage)
7. [Visualization](#visualization)
8. [Time Complexity](#time-complexity)

---

## What is a Hash Map?

A **hash map** (also called hash table) is a data structure that stores key-value pairs. It provides **O(1) average time complexity** for:
- **GET**: Retrieve a value by key
- **SET**: Store a key-value pair
- **DELETE**: Remove a key-value pair

### How Hash Maps Work

1. **Hash Function**: Converts a key into a number (bucket index)
2. **Buckets**: Array of containers where data is stored
3. **Collision Handling**: Multiple keys can hash to the same bucket

```
Key: "name"
  ↓
Hash Function
  ↓
Bucket Index: 5
  ↓
Store in buckets[5] = { "name": "John" }
```

---

## How Our Implementation Works

### 1. **Storage Structure**

We use an **array of objects** (buckets):

```typescript
buckets = [
  {},                    // Bucket 0 (empty)
  {},                    // Bucket 1 (empty)
  { "age": "25" },       // Bucket 2 (has data)
  {},                    // Bucket 3 (empty)
  ...
  { "name": "John" },    // Bucket 11 (has data)
  ...
]
```

- **16 buckets** total (can be configured)
- Each bucket is a **native JavaScript object** `{}`
- Objects provide **O(1) property access**

### 2. **Hash Function**

We use a **djb2-style hash function**:

```typescript
hash(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;  // Multiply by 31 and add
    hash = hash & hash;                   // Keep as 32-bit integer
  }
  return Math.abs(hash) % this.bucketCount;  // Fit in bucket range
}
```

**Example:**
- `hash("name")` → calculates → returns `11`
- `hash("age")` → calculates → returns `2`
- `hash("city")` → calculates → returns `8`

### 3. **Data Flow**

```
User Request: POST /keys {"key": "name", "value": "John"}
  ↓
1. Hash Function: hash("name") = 11
  ↓
2. Get Bucket: buckets[11]
  ↓
3. Store: buckets[11]["name"] = "John"
  ↓
4. Save to Disk: Write to ./data/store.txt
  ↓
Response: { "message": "Key created successfully" }
```

---

## Step-by-Step Explanation

### Step 1: Initialization

When you create `HashMapStore`:

```typescript
const store = new HashMapStore('./data/store.txt');
```

**What happens:**

1. **Create HashFunction**: `new HashFunction(16)` - handles hashing
2. **Create BucketManager**: `new BucketManager(16)` - manages buckets
3. **Create DiskPersistence**: `new DiskPersistence('./data/store.txt')` - handles file I/O
4. **Initialize Buckets**: Creates 16 empty objects
   ```typescript
   for (let i = 0; i < 16; i++) {
     buckets[i] = {};  // Empty object
   }
   ```
5. **Load from Disk**: If file exists, load data into RAM

**Result in RAM:**
```
buckets = [
  {}, {}, {}, {}, {}, {}, {}, {},
  {}, {}, {}, {}, {}, {}, {}, {}
]
```

### Step 2: Storing Data (SET)

When you call `store.set("name", "John")`:

**Step 2.1: Hash the Key**
```typescript
hashFunction.hash("name")
```
- Loops through each character: 'n', 'a', 'm', 'e'
- Calculates hash value: `3197797`
- Modulo 16: `3197797 % 16 = 11`
- **Returns: 11**

**Step 2.2: Get the Bucket**
```typescript
bucket = buckets[11]  // Direct array access - O(1)
```

**Step 2.3: Store in Bucket**
```typescript
buckets[11]["name"] = "John"  // Direct object property - O(1)
```

**Result in RAM:**
```
buckets[11] = {
  "name": "John"
}
```

**Step 2.4: Save to Disk**
```typescript
saveToDisk()  // Writes to ./data/store.txt
```

**File content:**
```
name:John
```

### Step 3: Retrieving Data (GET)

When you call `store.get("name")`:

**Step 3.1: Hash the Key**
```typescript
hashFunction.hash("name")  // Returns: 11
```

**Step 3.2: Get the Bucket**
```typescript
bucket = buckets[11]  // O(1) - direct array access
```

**Step 3.3: Get Value**
```typescript
return bucket["name"]  // O(1) - direct object property access
```

**Result:** `"John"`

**Total Time:** O(1) - constant time!

### Step 4: Updating Data (UPDATE)

When you call `store.update("name", "Jane")`:

1. Hash: `hash("name")` → `11`
2. Check: `buckets[11]["name"]` exists? → Yes
3. Update: `buckets[11]["name"] = "Jane"`
4. Save to disk

**Result:**
```
buckets[11] = {
  "name": "Jane"  // Updated!
}
```

### Step 5: Deleting Data (DELETE)

When you call `store.delete("name")`:

1. Hash: `hash("name")` → `11`
2. Check: `buckets[11]["name"]` exists? → Yes
3. Delete: `delete buckets[11]["name"]`
4. Save to disk

**Result:**
```
buckets[11] = {}  // Empty again
```

### Step 6: Collisions

**What is a collision?**

When two different keys hash to the same bucket:

```typescript
hash("key1") = 5
hash("key2") = 5  // Same bucket!
```

**How we handle it:**

Both keys are stored in the same bucket object:

```typescript
buckets[5] = {
  "key1": "value1",
  "key2": "value2"  // Both in same bucket!
}
```

**Why this works:**
- JavaScript objects can have multiple properties
- Each property access is still O(1)
- No performance degradation!

---

## Architecture Overview

### Class Structure

```
HashMapStore (Main Class)
├── HashFunction
│   └── hash(key) → bucket index
├── BucketManager
│   ├── buckets: Array<{ [key: string]: string }>
│   ├── setInBucket()
│   ├── getFromBucket()
│   └── deleteFromBucket()
└── DiskPersistence
    ├── save() → writes to file
    └── load() → reads from file
```

### File Structure

```
CacheLab/
├── src/
│   ├── core/
│   │   ├── HashMapStore.ts      # Main class
│   │   ├── HashFunction.ts      # Hash calculations
│   │   ├── BucketManager.ts     # Bucket management
│   │   ├── DiskPersistence.ts   # File I/O
│   │   └── StringUtils.ts       # String helpers
│   ├── api/
│   │   ├── KeysController.ts    # HTTP handlers
│   │   └── keys.routes.ts       # Route setup
│   ├── middleware/
│   │   ├── errorHandler.ts      # Error handling
│   │   └── requestLogger.ts     # Request logging
│   └── server.ts                 # Express server
├── data/
│   └── store.txt                # Persistent storage
└── package.json
```

---

## API Endpoints

### CRUD Operations

#### 1. **CREATE** - Add a new key-value pair
```bash
POST http://localhost:3000/keys
Content-Type: application/json

{
  "key": "name",
  "value": "John"
}
```

**Response:**
```json
{
  "message": "Key created successfully",
  "key": "name",
  "value": "John"
}
```

#### 2. **READ** - Get value by key
```bash
GET http://localhost:3000/keys/name
```

**Response:**
```json
{
  "key": "name",
  "value": "John"
}
```

#### 3. **UPDATE** - Update existing key
```bash
PUT http://localhost:3000/keys/name
Content-Type: application/json

{
  "value": "Jane"
}
```

**Response:**
```json
{
  "message": "Key updated successfully",
  "key": "name",
  "value": "Jane"
}
```

#### 4. **DELETE** - Remove a key
```bash
DELETE http://localhost:3000/keys/name
```

**Response:**
```json
{
  "message": "Key deleted successfully",
  "key": "name"
}
```

#### 5. **LIST** - Get all keys
```bash
GET http://localhost:3000/keys
```

**Response:**
```json
{
  "count": 3,
  "keys": ["name", "age", "city"],
  "data": {
    "name": "John",
    "age": "25",
    "city": "Paris"
  }
}
```

### Visualization Endpoints

#### 6. **Visualize All Buckets**
```bash
GET http://localhost:3000/keys/visualize/buckets
```

**Response:**
```json
{
  "totalBuckets": 16,
  "totalItems": 3,
  "buckets": [
    {
      "bucketIndex": 0,
      "items": {},
      "itemCount": 0
    },
    {
      "bucketIndex": 11,
      "items": {
        "name": "John"
      },
      "itemCount": 1
    },
    ...
  ],
  "hashDistribution": {
    "0": 0,
    "1": 0,
    ...
    "11": 1,
    ...
  }
}
```

#### 7. **Check Key Location**
```bash
GET http://localhost:3000/keys/visualize/key/name
```

**Response:**
```json
{
  "key": "name",
  "bucketIndex": 11,
  "exists": true,
  "value": "John",
  "message": "Key \"name\" is stored in bucket 11"
}
```

---

## Installation & Usage

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Installation

```bash
cd CacheLab
npm install
```

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

### Testing with cURL

```bash
# Create a key
curl -X POST http://localhost:3000/keys \
  -H "Content-Type: application/json" \
  -d '{"key":"name","value":"John"}'

# Get a key
curl http://localhost:3000/keys/name

# Update a key
curl -X PUT http://localhost:3000/keys/name \
  -H "Content-Type: application/json" \
  -d '{"value":"Jane"}'

# Delete a key
curl -X DELETE http://localhost:3000/keys/name

# List all keys
curl http://localhost:3000/keys

# Visualize buckets
curl http://localhost:3000/keys/visualize/buckets
```

---

## Visualization

### Why Visualization?

Visualization helps you:
- **See** where data is stored in RAM
- **Understand** hash distribution
- **Debug** bucket assignments
- **Learn** how hash maps work

### How to Use

1. **View all buckets:**
   ```bash
   curl http://localhost:3000/keys/visualize/buckets | python3 -m json.tool
   ```

2. **Check specific key:**
   ```bash
   curl http://localhost:3000/keys/visualize/key/name | python3 -m json.tool
   ```

3. **In browser:**
   - Open: `http://localhost:3000/keys/visualize/buckets`
   - See the complete bucket structure

### Example Output

After storing `name`, `age`, and `city`:

```json
{
  "totalBuckets": 16,
  "totalItems": 3,
  "buckets": [
    {"bucketIndex": 0, "items": {}, "itemCount": 0},
    {"bucketIndex": 1, "items": {}, "itemCount": 0},
    {"bucketIndex": 2, "items": {"age": "25"}, "itemCount": 1},
    ...
    {"bucketIndex": 11, "items": {"name": "John"}, "itemCount": 1},
    ...
  ]
}
```

This shows:
- **Bucket 2** contains `age`
- **Bucket 11** contains `name`
- Other buckets are empty

---

## Time Complexity

### Operations

| Operation | Time Complexity | Explanation |
|-----------|----------------|-------------|
| `get(key)` | **O(1)** | Hash + direct bucket access + property access |
| `set(key, value)` | **O(1)** | Hash + direct bucket access + property assignment |
| `update(key, value)` | **O(1)** | Hash + direct bucket access + property update |
| `delete(key)` | **O(1)** | Hash + direct bucket access + property deletion |
| `getAllKeys()` | **O(n)** | Must visit all items (unavoidable) |
| `getAll()` | **O(n)** | Must visit all items (unavoidable) |

### Why O(1)?

1. **Hash Function**: O(k) where k = key length, but k is bounded → **O(1)**
2. **Bucket Access**: `buckets[index]` → **O(1)** (direct array access)
3. **Property Access**: `bucket[key]` → **O(1)** (native object property)

**Total: O(1)** - Constant time regardless of number of items!

### Example

Whether you have:
- 10 items → O(1)
- 1,000 items → O(1)
- 1,000,000 items → O(1)

The time to get/set/delete is **always the same**!

---

## Key Concepts Explained

### 1. **Buckets**

Buckets are containers that hold key-value pairs. We use 16 buckets by default.

```
Bucket 0: {}
Bucket 1: {}
Bucket 2: {"age": "25"}
Bucket 3: {}
...
Bucket 11: {"name": "John"}
...
```

### 2. **Hash Function**

The hash function converts a key into a bucket index:

```
"name" → hash function → 11 → buckets[11]
"age"  → hash function → 2  → buckets[2]
```

### 3. **Collision Handling**

When two keys hash to the same bucket, both are stored in the same object:

```
hash("key1") = 5
hash("key2") = 5

buckets[5] = {
  "key1": "value1",
  "key2": "value2"
}
```

### 4. **RAM vs Disk**

- **RAM**: Fast access, temporary (lost on restart)
- **Disk**: Permanent storage, slower

Our system:
- Stores in **RAM** for fast access (O(1))
- Saves to **disk** for persistence
- Loads from **disk** on startup

---

## Data Persistence

### File Format

Data is stored in `./data/store.txt`:

```
name:John
age:25
city:Paris
```

### How It Works

1. **On SET/UPDATE/DELETE**: Data is saved to disk automatically
2. **On Startup**: Data is loaded from disk into RAM
3. **Format**: `key:value` (one per line)

### Special Characters

Special characters are escaped:
- `:` becomes `::`
- `\n` becomes `\\n`
- `\` becomes `\\\\`

---

## Summary

### What We Built

✅ Custom hash map implementation  
✅ O(1) time complexity for get/set/delete  
✅ RAM storage with disk persistence  
✅ RESTful API with CRUD operations  
✅ Visualization tools  
✅ Object-oriented design with multiple classes  

### Key Takeaways

1. **Hash maps are fast**: O(1) operations
2. **Buckets organize data**: Hash function distributes keys
3. **Objects provide O(1) access**: Native JavaScript objects
4. **Persistence matters**: Data survives restarts
5. **Visualization helps**: Understand the structure

---

## Next Steps

- Try the API endpoints
- Visualize the buckets
- Add more keys and see distribution
- Experiment with different key names
- Check which buckets they hash to

**Happy coding! 🚀**

