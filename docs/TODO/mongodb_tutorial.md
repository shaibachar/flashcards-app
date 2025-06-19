# Complete MongoDB Database Tutorial

## Table of Contents
1. [Introduction to MongoDB](#introduction-to-mongodb)
2. [Installation and Setup](#installation-and-setup)
3. [Basic Operations and CRUD](#basic-operations-and-crud)
4. [Data Modeling and Schema Design](#data-modeling-and-schema-design)
5. [Indexing and Query Optimization](#indexing-and-query-optimization)
6. [Aggregation Framework](#aggregation-framework)
7. [Replication and High Availability](#replication-and-high-availability)
8. [Sharding and Horizontal Scaling](#sharding-and-horizontal-scaling)
9. [Security and Authentication](#security-and-authentication)
10. [Performance Monitoring and Troubleshooting](#performance-monitoring-and-troubleshooting)

## 1. Introduction to MongoDB

MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional relational databases that use tables and rows, MongoDB uses collections and documents, making it particularly well-suited for modern applications that handle varied and evolving data structures.

### Key Features

**Document-Oriented Storage**: MongoDB stores data as documents, which are similar to JSON objects. Each document can have a different structure, allowing for flexible schemas that can evolve over time without requiring database migrations.

**Dynamic Schema**: Unlike relational databases that require predefined schemas, MongoDB allows you to add fields to documents without modifying the entire collection structure. This flexibility is particularly valuable during rapid application development.

**Rich Query Language**: MongoDB provides a powerful query language that supports complex queries, including field queries, range queries, regular expressions, and geospatial queries. The query language is designed to be intuitive for developers familiar with JSON.

**Horizontal Scalability**: MongoDB supports horizontal scaling through sharding, allowing you to distribute data across multiple servers. This capability enables handling massive datasets and high-throughput applications.

**Replication**: Built-in replication provides high availability and data redundancy. MongoDB replica sets automatically handle failover and recovery, ensuring your application remains available even if individual servers fail.

**Aggregation Framework**: MongoDB includes a powerful aggregation pipeline that allows for complex data processing and analysis operations, similar to SQL's GROUP BY and JOIN operations but designed for document data.

### MongoDB vs Relational Databases

Traditional relational databases organize data in tables with fixed schemas, requiring JOIN operations to combine related data. MongoDB, in contrast, can embed related data within documents, reducing the need for complex joins and improving query performance. This approach is particularly beneficial for applications with complex, nested data structures or those requiring rapid schema changes.

### Common Use Cases

MongoDB excels in content management systems where document structure varies, real-time analytics applications requiring flexible data models, Internet of Things applications with diverse sensor data, e-commerce platforms with product catalogs containing varying attributes, and mobile applications requiring offline synchronization capabilities.

## 2. Installation and Setup

### Local Installation

**Windows Installation**:
Download the MongoDB Community Server from the official MongoDB website. Run the installer and follow the setup wizard. The installer creates a Windows service that starts automatically.

**macOS Installation**:
Using Homebrew, the installation is straightforward:

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

**Linux Installation (Ubuntu/Debian)**:

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Docker Installation

Docker provides a convenient way to run MongoDB, especially for development environments:

```bash
# Run MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# Run with persistent storage
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# Connect to MongoDB container
docker exec -it mongodb mongosh
```

### MongoDB Compass

MongoDB Compass is the official GUI tool for MongoDB, providing a visual interface for database management:

```bash
# Download and install from MongoDB website
# Or install via package manager on macOS
brew install --cask mongodb-compass
```

### Configuration

The main MongoDB configuration file is typically located at `/etc/mongod.conf` (Linux) or `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg` (Windows).

**Basic Configuration** (`mongod.conf`):

```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,::1

# Storage configuration
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Process management
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

# Security
security:
  authorization: enabled
```

### Connecting to MongoDB

**Using MongoDB Shell (mongosh)**:

```bash
# Connect to local MongoDB
mongosh

# Connect with authentication
mongosh "mongodb://username:password@localhost:27017/database"

# Connect to remote MongoDB
mongosh "mongodb://username:password@remote-host:27017/database"

# Connect to MongoDB Atlas (cloud)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

## 3. Basic Operations and CRUD

### Database and Collection Operations

MongoDB organizes data into databases, which contain collections of documents. Unlike SQL databases, you don't need to explicitly create databases or collections - they're created automatically when you first insert data.

**Database Operations**:

```javascript
// Show all databases
show dbs

// Switch to or create a database
use myapp

// Show current database
db

// Drop database
db.dropDatabase()
```

**Collection Operations**:

```javascript
// Show collections in current database
show collections

// Create collection explicitly (optional)
db.createCollection("users")

// Create collection with options
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: "number" }
      }
    }
  }
})

// Drop collection
db.users.drop()
```

### Create Operations (Insert)

**Insert Single Document**:

```javascript
// Insert a single document
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
    zipcode: "10001"
  },
  hobbies: ["reading", "swimming", "coding"],
  createdAt: new Date()
})

// The operation returns the inserted document's _id
```

**Insert Multiple Documents**:

```javascript
// Insert multiple documents
db.users.insertMany([
  {
    name: "Jane Smith",
    email: "jane@example.com",
    age: 25,
    department: "Engineering"
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    department: "Marketing"
  },
  {
    name: "Alice Brown",
    email: "alice@example.com",
    age: 28,
    department: "Engineering"
  }
])
```

### Read Operations (Find)

**Basic Queries**:

```javascript
// Find all documents
db.users.find()

// Find with pretty formatting
db.users.find().pretty()

// Find one document
db.users.findOne()

// Find with filter
db.users.find({ name: "John Doe" })

// Find with multiple conditions
db.users.find({ 
  age: { $gte: 25 }, 
  department: "Engineering" 
})
```

**Query Operators**:

```javascript
// Comparison operators
db.users.find({ age: { $gt: 25 } })        // Greater than
db.users.find({ age: { $gte: 25 } })       // Greater than or equal
db.users.find({ age: { $lt: 35 } })        // Less than
db.users.find({ age: { $lte: 35 } })       // Less than or equal
db.users.find({ age: { $ne: 30 } })        // Not equal
db.users.find({ age: { $in: [25, 30, 35] } }) // In array

// Logical operators
db.users.find({ 
  $and: [
    { age: { $gte: 25 } },
    { department: "Engineering" }
  ]
})

db.users.find({ 
  $or: [
    { age: { $lt: 25 } },
    { department: "Marketing" }
  ]
})

// Element operators
db.users.find({ department: { $exists: true } })  // Field exists
db.users.find({ hobbies: { $type: "array" } })    // Field type check

// Array operators
db.users.find({ hobbies: { $in: ["reading"] } })  // Array contains
db.users.find({ hobbies: { $all: ["reading", "coding"] } }) // Contains all
db.users.find({ hobbies: { $size: 3 } })          // Array size
```

**Projection and Limiting**:

```javascript
// Project specific fields (1 = include, 0 = exclude)
db.users.find({}, { name: 1, email: 1, _id: 0 })

// Exclude specific fields
db.users.find({}, { password: 0 })

// Limit results
db.users.find().limit(5)

// Skip results (pagination)
db.users.find().skip(10).limit(5)

// Sort results
db.users.find().sort({ age: 1 })     // Ascending
db.users.find().sort({ age: -1 })    // Descending
db.users.find().sort({ department: 1, age: -1 }) // Multiple fields
```

**Nested Document Queries**:

```javascript
// Query nested documents
db.users.find({ "address.city": "New York" })

// Query array elements
db.users.find({ "hobbies.0": "reading" })  // First element
db.users.find({ hobbies: "reading" })      // Contains element
```

### Update Operations

**Update Single Document**:

```javascript
// Update one document
db.users.updateOne(
  { name: "John Doe" },           // Filter
  { 
    $set: { 
      age: 31,
      "address.zipcode": "10002"
    }
  }
)

// Update with operators
db.users.updateOne(
  { name: "John Doe" },
  {
    $inc: { age: 1 },                    // Increment
    $push: { hobbies: "photography" },   // Add to array
    $set: { lastModified: new Date() }
  }
)
```

**Update Multiple Documents**:

```javascript
// Update multiple documents
db.users.updateMany(
  { department: "Engineering" },
  { 
    $set: { 
      bonus: true,
      lastUpdated: new Date()
    }
  }
)
```

**Update Operators**:

```javascript
// Field update operators
$set       // Set field value
$unset     // Remove field
$inc       // Increment numeric value
$mul       // Multiply numeric value
$rename    // Rename field

// Array update operators
$push      // Add element to array
$pop       // Remove first/last element
$pull      // Remove elements matching condition
$pullAll   // Remove multiple specific elements
$addToSet  // Add element if not exists

// Example usage
db.users.updateOne(
  { name: "John Doe" },
  {
    $push: { hobbies: { $each: ["gaming", "traveling"] } },
    $inc: { loginCount: 1 },
    $set: { lastLogin: new Date() }
  }
)
```

**Upsert Operations**:

```javascript
// Update or insert if not exists
db.users.updateOne(
  { email: "new@example.com" },
  { 
    $set: { 
      name: "New User",
      createdAt: new Date()
    }
  },
  { upsert: true }
)
```

### Delete Operations

**Delete Single Document**:

```javascript
// Delete one document
db.users.deleteOne({ name: "John Doe" })

// Delete with complex filter
db.users.deleteOne({ 
  age: { $lt: 18 },
  active: false
})
```

**Delete Multiple Documents**:

```javascript
// Delete multiple documents
db.users.deleteMany({ department: "Marketing" })

// Delete all documents (but keep collection)
db.users.deleteMany({})
```

### Bulk Operations

For better performance when performing multiple operations, use bulk operations:

```javascript
// Bulk write operations
db.users.bulkWrite([
  { 
    insertOne: { 
      document: { name: "User1", email: "user1@example.com" }
    }
  },
  { 
    updateOne: {
      filter: { name: "User2" },
      update: { $set: { active: true } }
    }
  },
  { 
    deleteOne: {
      filter: { name: "User3" }
    }
  }
])
```

## 4. Data Modeling and Schema Design

### Document Structure Design

MongoDB's flexible document model allows for various design patterns. The key is to model your data based on how your application queries and updates it.

**Embedding vs Referencing**:

**Embedding** (Denormalized):

```javascript
// Embed related data within documents
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "New York",
    zipcode: "10001"
  },
  orders: [
    {
      orderId: "ORD001",
      date: ISODate("2024-01-15"),
      total: 99.99,
      items: [
        { product: "Laptop", quantity: 1, price: 99.99 }
      ]
    }
  ]
}
```

**Referencing** (Normalized):

```javascript
// Users collection
{
  _id: ObjectId("user123"),
  name: "John Doe",
  email: "john@example.com"
}

// Orders collection
{
  _id: ObjectId("order456"),
  userId: ObjectId("user123"),
  date: ISODate("2024-01-15"),
  total: 99.99,
  items: [ObjectId("item789")]
}

// Items collection
{
  _id: ObjectId("item789"),
  product: "Laptop",
  quantity: 1,
  price: 99.99
}
```

### Design Patterns

**One-to-One Relationships**:

```javascript
// Embed when data is always accessed together
{
  _id: ObjectId("..."),
  username: "johndoe",
  profile: {
    firstName: "John",
    lastName: "Doe",
    bio: "Software developer",
    avatar: "avatar.jpg"
  }
}
```

**One-to-Many Relationships**:

```javascript
// Embed when "many" side has few items and limited growth
{
  _id: ObjectId("..."),
  name: "Blog Post",
  content: "...",
  comments: [
    {
      author: "Alice",
      text: "Great post!",
      date: ISODate("2024-01-15")
    }
  ]
}

// Reference when "many" side can grow large
// Posts collection
{
  _id: ObjectId("post123"),
  title: "Blog Post",
  content: "..."
}

// Comments collection
{
  _id: ObjectId("comment456"),
  postId: ObjectId("post123"),
  author: "Alice",
  text: "Great post!"
}
```

**Many-to-Many Relationships**:

```javascript
// Using arrays of references
// Users collection
{
  _id: ObjectId("user123"),
  name: "John Doe",
  skillIds: [ObjectId("skill456"), ObjectId("skill789")]
}

// Skills collection
{
  _id: ObjectId("skill456"),
  name: "JavaScript",
  userIds: [ObjectId("user123"), ObjectId("user321")]
}
```

### Schema Validation

MongoDB supports schema validation to ensure data quality:

```javascript
// Create collection with validation
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "category"],
      properties: {
        name: {
          bsonType: "string",
          description: "Product name is required and must be a string"
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Price must be a positive number"
        },
        category: {
          bsonType: "string",
          enum: ["electronics", "clothing", "books", "sports"],
          description: "Category must be one of the predefined values"
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})
```

### Data Types and Best Practices

**BSON Data Types**:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),    // ObjectId
  name: "John Doe",                             // String
  age: 30,                                      // Number (Int32)
  salary: NumberLong("50000"),                  // Long (Int64)
  rating: 4.5,                                  // Double
  active: true,                                 // Boolean
  birthDate: ISODate("1993-01-01"),            // Date
  data: BinData(0, "base64encodeddata"),       // Binary
  pattern: /pattern/i,                          // Regex
  coordinates: [40.7128, -74.0060],            // Array
  address: { street: "123 Main St" },          // Object
  nullField: null,                             // Null
  undefinedField: undefined                     // Undefined (not recommended)
}
```

**Best Practices**:

Design documents around your query patterns rather than trying to normalize everything. Embed data that is frequently accessed together and reference data that is large or frequently updated independently. Use meaningful field names and consistent naming conventions throughout your application. Consider document size limits (16MB maximum) when designing embedded structures.

## 5. Indexing and Query Optimization

### Understanding Indexes

Indexes in MongoDB work similarly to indexes in relational databases - they create data structures that improve query performance by avoiding full collection scans.

**Creating Indexes**:

```javascript
// Create single field index
db.users.createIndex({ email: 1 })        // Ascending
db.users.createIndex({ age: -1 })         // Descending

// Create compound index
db.users.createIndex({ department: 1, age: -1 })

// Create unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Create partial index (only index documents matching condition)
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { age: { $gte: 18 } } }
)

// Create TTL index (automatic expiration)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // Expire after 1 hour
)
```

**Index Types**:

```javascript
// Single field index
db.products.createIndex({ name: 1 })

// Compound index
db.products.createIndex({ category: 1, price: -1 })

// Multikey index (automatically created for arrays)
db.users.createIndex({ hobbies: 1 })

// Text index (for text search)
db.articles.createIndex({ title: "text", content: "text" })

// Geospatial index
db.locations.createIndex({ coordinates: "2dsphere" })

// Hashed index (for sharding)
db.users.createIndex({ userId: "hashed" })
```

**Managing Indexes**:

```javascript
// List all indexes
db.users.getIndexes()

// Get index statistics
db.users.stats().indexSizes

// Drop index
db.users.dropIndex({ email: 1 })
db.users.dropIndex("email_1")  // By name

// Rebuild indexes
db.users.reIndex()

// Background index creation (non-blocking)
db.users.createIndex({ field: 1 }, { background: true })
```

### Query Performance Analysis

**Using explain()**:

```javascript
// Basic explain
db.users.find({ age: { $gte: 25 } }).explain()

// Detailed execution stats
db.users.find({ age: { $gte: 25 } }).explain("executionStats")

// All available information
db.users.find({ age: { $gte: 25 } }).explain("allPlansExecution")
```

**Understanding Explain Output**:

```javascript
// Key metrics to look for:
{
  "executionStats": {
    "totalDocsExamined": 1000,     // Documents scanned
    "totalDocsReturned": 100,      // Documents returned
    "executionTimeMillis": 5,      // Query execution time
    "stage": "IXSCAN",             // Index scan (good)
    // vs "COLLSCAN" (collection scan - bad for large collections)
  }
}
```

### Query Optimization Techniques

**Index Usage Patterns**:

```javascript
// Compound index field order matters
db.users.createIndex({ department: 1, age: 1, salary: 1 })

// This query uses the index efficiently
db.users.find({ department: "Engineering", age: { $gte: 25 } })

// This query cannot use the index efficiently (skips department)
db.users.find({ age: { $gte: 25 }, salary: { $gt: 50000 } })

// Query with sort - index should match sort order
db.users.find({ department: "Engineering" }).sort({ age: 1 })
```

**Optimizing Aggregation Pipelines**:

```javascript
// Use $match early to reduce documents
db.orders.aggregate([
  { $match: { status: "completed" } },    // Filter first
  { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
])

// Use indexes for $sort
db.orders.createIndex({ customerId: 1, total: -1 })
```

### Profiling and Monitoring

**Database Profiler**:

```javascript
// Enable profiler for slow operations (>100ms)
db.setProfilingLevel(1, { slowms: 100 })

// Enable profiler for all operations
db.setProfilingLevel(2)

// Check profiler status
db.getProfilingStatus()

// Query profiler collection
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Disable profiler
db.setProfilingLevel(0)
```

**Current Operations**:

```javascript
// See currently running operations
db.currentOp()

// Kill long-running operation
db.killOp(operationId)
```

## 6. Aggregation Framework

The aggregation framework provides powerful data processing capabilities, allowing you to perform complex transformations, calculations, and analysis on your data.

### Basic Aggregation Pipeline

The aggregation pipeline consists of stages that process documents sequentially:

```javascript
// Basic pipeline structure
db.collection.aggregate([
  { $stage1: { ... } },
  { $stage2: { ... } },
  { $stage3: { ... } }
])

// Example: Calculate average age by department
db.users.aggregate([
  { $group: { 
      _id: "$department", 
      averageAge: { $avg: "$age" },
      count: { $sum: 1 }
  }},
  { $sort: { averageAge: -1 } }
])
```

### Common Aggregation Stages

**$match - Filtering Documents**:

```javascript
// Filter documents (similar to find())
db.orders.aggregate([
  { $match: { 
      status: "completed",
      orderDate: { $gte: ISODate("2024-01-01") }
  }}
])

// $match should be used early in pipeline for performance
```

**$group - Grouping and Accumulation**:

```javascript
// Group by single field
db.sales.aggregate([
  { $group: {
      _id: "$region",
      totalSales: { $sum: "$amount" },
      averageOrder: { $avg: "$amount" },
      orderCount: { $sum: 1 },
      maxOrder: { $max: "$amount" },
      minOrder: { $min: "$amount" }
  }}
])

// Group by multiple fields
db.sales.aggregate([
  { $group: {
      _id: { 
        region: "$region",
        year: { $year: "$orderDate" }
      },
      totalSales: { $sum: "$amount" }
  }}
])
```

**$project - Reshaping Documents**:

```javascript
// Include/exclude fields and create computed fields
db.users.aggregate([
  { $project: {
      name: 1,
      email: 1,
      age: 1,
      isAdult: { $gte: ["$age", 18] },
      fullName: { $concat: ["$firstName", " ", "$lastName"] },
      _id: 0
  }}
])

// Complex projections
db.orders.aggregate([
  { $project: {
      orderNumber: 1,
      total: 1,
      discountedTotal: {
        $subtract: ["$total", { $multiply: ["$total", "$discountRate"] }]
      },
      orderYear: { $year: "$orderDate" }
  }}
])
```

**$sort - Sorting Documents**:

```javascript
// Sort by single field
db.products.aggregate([
  { $sort: { price: -1 } }  // Descending order
])

// Sort by multiple fields
db.users.aggregate([
  { $sort: { department: 1, age: -1 } }
])
```

**$limit and $skip - Pagination**:

```javascript
// Limit results
db.products.aggregate([
  { $sort: { price: -1 } },
  { $limit: 10 }
])

// Skip and limit (pagination)
db.products.aggregate([
  { $sort: { price: -1 } },
  { $skip: 20 },
  { $limit: 10 }
])
```

### Advanced Aggregation Operations

**$lookup - Joining Collections**:

```javascript
// Join users with their orders
db.users.aggregate([
  { $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "userOrders"
  }},
  { $project: {
      name: 1,
      email: 1,
      orderCount: { $size: "$userOrders" },
      totalSpent: { $sum: "$userOrders.total" }
  }}
])

// Complex lookup with pipeline
db.users.aggregate([
  { $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        { $match: { 
            $expr: { $eq: ["$userId", "$$userId"] },
            status: "completed"
        }},
        { $project: { total: 1, orderDate: 1 } }
      ],
      as: "completedOrders"
  }}
])
```

**$unwind - Deconstructing Arrays**:

```javascript
// Flatten array fields
db.articles.aggregate([
  { $unwind: "$tags" },
  { $group: {
      _id: "$tags",
      articleCount: { $sum: 1 }
  }},
  { $sort: { articleCount: -1 } }
])

// Preserve null and empty arrays
db.articles.aggregate([
  { $unwind: { 
      path: "$tags",
      preserveNullAndEmptyArrays: true
  }}
])
```

**$facet - Multiple Pipelines**:

```javascript
// Run multiple aggregation pipelines in parallel
db.products.aggregate([
  { $facet: {
      "priceRanges": [
        { $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ["$price", 100] }, then: "Under $100" },
                  { case: { $lt: ["$price", 500] }, then: "$100-$500" },
                  { case: { $gte: ["$price", 500] }, then: "Over $500" }
                ]
              }
            },
            count: { $sum: 1 }
        }}
      ],
      "categoryStats": [
        { $group: {
            _id: "$category",
            avgPrice: { $avg: "$price" },
            count: { $sum: 1 }
        }}
      ]
  }}
])
```

### Date and String Operations

**Date Operations**:

```javascript
// Extract date components
db.orders.aggregate([
  { $project: {
      orderNumber: 1,
      year: { $year: "$orderDate" },
      month: { $month: "$orderDate" },
      dayOfWeek: { $dayOfWeek: "$orderDate" },
      quarter: {
        $ceil: { $divide: [{ $month: "$orderDate" }, 3] }
      }
  }}
])

// Date arithmetic
db.subscriptions.aggregate([
  { $project: {
      userId: 1,
      startDate: 1,
      endDate: 1,
      daysRemaining: {
        $divide: [
          { $subtract: ["$endDate", new Date()] },
          1000 * 60 * 60 * 24  // Convert ms to days
        ]
      }
  }}
])
```

**String Operations**:

```javascript
// String manipulation
db.users.aggregate([
  { $project: {
      name: 1,
      email: 1,
      emailDomain: {
        $arrayElemAt: [
          { $split: ["$email", "@"] },
          1
        ]
      },
      initials: {
        $concat: [
          { $substr: ["$firstName", 0, 1] },
          { $substr: ["$lastName", 0, 1] }
        ]
      }
  }}
])
```

### Performance Optimization

**Pipeline Optimization**:

```javascript
// Use $match early to reduce documents
db.orders.aggregate([
  { $match: { status: "completed" } },  // Filter first
  { $lookup: { /* expensive operation */ } },
  { $group: { /* grouping */ } }
])

// Use indexes for $match and $sort stages
db.orders.createIndex({ status: 1, orderDate: -1 })

// Limit results early when possible
db.products.aggregate([
  { $sort: { price: -1 } },
  { $limit: 100 },  // Limit before expensive operations
  { $lookup: { /* expensive join */ } }
])
```

## 7. Replication and High Availability

### Replica Sets

A replica set is a group of MongoDB servers that maintain the same data set, providing redundancy and high availability.

**Replica Set Architecture**:

```javascript
// Typical 3-member replica set
// Primary (1) - accepts writes and reads
// Secondary (2) - replicates data, can serve reads
// Arbiter (optional) - participates in elections but holds no data
```

**Setting Up Replica Set**:

```bash
# Start MongoDB instances on different ports
mongod --replSet myReplicaSet --port 27017 --dbpath /data/db1
mongod --replSet myReplicaSet --port 27018 --dbpath /data/db2  
mongod --replSet myReplicaSet --port 27019 --dbpath /data/db3
```

**Initialize Replica Set**:

```javascript
// Connect to one instance and initialize
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})

// Check replica set status
rs.status()

// Check replica set configuration
rs.conf()
```

**Managing Replica Set**:

```javascript
// Add new member
rs.add("localhost:27020")

// Add member with specific configuration
rs.add({
  _id: 3,
  host: "localhost:27020",
  priority: 0,      // Cannot become primary
  hidden: true      // Hidden from application
})

// Remove member
rs.remove("localhost:27020")

// Force reconfiguration
var config = rs.conf()
config.members[0].priority = 2
rs.reconfig(config)
```

**Replica Set Elections**:

```javascript
// Step down current primary (triggers election)
rs.stepDown()

// Force election
rs.freeze(0)  // Unfreeze member to participate in elections

// Check election metrics
rs.status().members[0].electionTime
```

### Read Preferences

Control how your application routes read operations:

```javascript
// Primary (default) - read from primary only
db.collection.find().readPref("primary")

// Primary preferred - read from primary, fallback to secondary
db.collection.find().readPref("primaryPreferred")

// Secondary - read from secondary only
db.collection.find().readPref("secondary")

// Secondary preferred - read from secondary, fallback to primary
db.collection.find().readPref("secondaryPreferred")

// Nearest - read from member with lowest latency
db.collection.find().readPref("nearest")
```

**Read Preference with Tags**:

```javascript
// Configure members with tags
var config = rs.conf()
config.members[0].tags = { "region": "us-east", "datacenter": "dc1" }
config.members[1].tags = { "region": "us-west", "datacenter": "dc2" }
rs.reconfig(config)

// Read from specific tagged members
db.collection.find().readPref("secondary", [
  { "region": "us-east" },
  { "datacenter": "dc1" }
])
```

### Write Concerns

Control write acknowledgment behavior:

```javascript
// Default write concern
db.collection.insertOne(doc, { writeConcern: { w: 1 } })

// Majority write concern (recommended for important data)
db.collection.insertOne(doc, { 
  writeConcern: { 
    w: "majority",
    j: true,      // Wait for journal
    wtimeout: 5000 // Timeout in milliseconds
  }
})

// Write to specific number of members
db.collection.insertOne(doc, { writeConcern: { w: 2 } })

// Custom write concern
db.runCommand({
  setDefaultRWConcern: 1,
  defaultWriteConcern: {
    w: "majority",
    j: true
  }
})
```

### Monitoring Replication

**Replication Lag**:

```javascript
// Check replication lag
rs.printReplicationInfo()
rs.printSlaveReplicationInfo()

// Monitor oplog
db.oplog.rs.find().sort({ $natural: -1 }).limit(5)

// Get replication metrics
db.runCommand({ replSetGetStatus: 1 })
```

**Oplog Management**:

```javascript
// Check oplog size
db.oplog.rs.stats()

// Resize oplog (MongoDB 3.6+)
db.adminCommand({ replSetResizeOplog: 1, size: 2048 })  // 2GB
```

## 8. Sharding and Horizontal Scaling

### Sharded Cluster Architecture

A sharded cluster consists of shards (data), config servers (metadata), and mongos routers (query routing).

**Components**:
- **Shards**: Store the actual data chunks
- **Config Servers**: Store cluster metadata and configuration
- **Mongos**: Route queries to appropriate shards

**Setting Up Sharded Cluster**:

```bash
# Start config servers (replica set)
mongod --configsvr --replSet configReplicaSet --port 27019 --dbpath /data/configdb1
mongod --configsvr --replSet configReplicaSet --port 27020 --dbpath /data/configdb2
mongod --configsvr --replSet configReplicaSet --port 27021 --dbpath /data/configdb3

# Start shard servers
mongod --shardsvr --replSet shard1 --port 27017 --dbpath /data/shard1
mongod --shardsvr --replSet shard2 --port 27018 --dbpath /data/shard2

# Start mongos router
mongos --configdb configReplicaSet/localhost:27019,localhost:27020,localhost:27021 --port 27016
```

**Initialize Sharded Cluster**:

```javascript
// Connect to mongos and add shards
sh.addShard("shard1/localhost:27017")
sh.addShard("shard2/localhost:27018")

// Enable sharding for database
sh.enableSharding("myapp")

// Shard collection
sh.shardCollection("myapp.users", { userId: 1 })

// Check sharding status
sh.status()
```

### Shard Keys

Choosing the right shard key is crucial for performance and scalability:

**Good Shard Key Characteristics**:
- High cardinality (many unique values)
- Even distribution of data
- Supports common query patterns
- Avoids hotspots

**Shard Key Examples**:

```javascript
// Hashed shard key (good for even distribution)
sh.shardCollection("myapp.users", { userId: "hashed" })

// Compound shard key
sh.shardCollection("myapp.orders", { customerId: 1, orderDate: 1 })

// Range-based sharding
sh.shardCollection("myapp.logs", { timestamp: 1 })
```

### Managing Sharded Collections

**Chunk Management**:

```javascript
// View chunk distribution
db.printShardingStatus()

// Manual chunk splitting
sh.splitAt("myapp.users", { userId: "user12345" })

// Move chunks between shards
sh.moveChunk("myapp.users", { userId: "user12345" }, "shard2")

// Enable/disable balancer
sh.enableBalancing("myapp.users")
sh.disableBalancing("myapp.users")

// Check balancer status
sh.getBalancerState()
```

**Zone Sharding** (for geographic data distribution):

```javascript
// Add zones to shards
sh.addShardToZone("shard1", "US")
sh.addShardToZone("shard2", "EU")

// Define zone ranges
sh.updateZoneKeyRange("myapp.users", 
  { region: "US", userId: MinKey }, 
  { region: "US", userId: MaxKey }, 
  "US")

sh.updateZoneKeyRange("myapp.users", 
  { region: "EU", userId: MinKey }, 
  { region: "EU", userId: MaxKey }, 
  "EU")
```

### Query Optimization in Sharded Environment

**Targeted vs Broadcast Queries**:

```javascript
// Targeted query (includes shard key)
db.users.find({ userId: "user12345" })  // Routes to specific shard

// Broadcast query (missing shard key)
db.users.find({ email: "user@example.com" })  // Queries all shards

// Compound shard key query
db.orders.find({ customerId: "cust123", orderDate: { $gte: ISODate("2024-01-01") } })
```

**Aggregation in Sharded Environment**:

```javascript
// Aggregation pipeline optimization
db.orders.aggregate([
  { $match: { customerId: "cust123" } },  // Uses shard key for targeting
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 9. Security and Authentication

### Authentication

**Creating Admin User**:

```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "securePassword123",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" },
    { role: "clusterAdmin", db: "admin" }
  ]
})
```

**Database-Specific Users**:

```javascript
// Create application user
use myapp
db.createUser({
  user: "appuser",
  pwd: "appPassword123",
  roles: [
    { role: "readWrite", db: "myapp" }
  ]
})

// Create read-only user
db.createUser({
  user: "readonly",
  pwd: "readPassword123",
  roles: [
    { role: "read", db: "myapp" }
  ]
})
```

**Custom Roles**:

```javascript
// Create custom role
use myapp
db.createRole({
  role: "customRole",
  privileges: [
    {
      resource: { db: "myapp", collection: "users" },
      actions: ["find", "insert", "update"]
    },
    {
      resource: { db: "myapp", collection: "logs" },
      actions: ["find", "insert"]
    }
  ],
  roles: []
})

// Assign custom role to user
db.createUser({
  user: "customuser",
  pwd: "customPassword123",
  roles: ["customRole"]
})
```

### Authorization Configuration

**Enable Authentication** in `mongod.conf`:

```yaml
security:
  authorization: enabled
  keyFile: /path/to/keyfile  # For replica sets/sharding
```

**Connecting with Authentication**:

```bash
# Connect with credentials
mongosh "mongodb://username:password@localhost:27017/database"

# Or authenticate after connecting
mongosh
use admin
db.auth("username", "password")
```

### Network Security

**TLS/SSL Configuration**:

```yaml
# In mongod.conf
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /path/to/mongodb.pem
    CAFile: /path/to/ca.pem
    allowConnectionsWithoutCertificates: false
```

**IP Binding and Firewall**:

```yaml
# Bind to specific interfaces
net:
  bindIp: 127.0.0.1,10.0.0.100
  port: 27017
```

### Encryption

**Encryption at Rest** (MongoDB Enterprise):

```yaml
security:
  enableEncryption: true
  encryptionKeyFile: /path/to/keyfile
```

**Field-Level Encryption**:

```javascript
// Client-side field level encryption setup
const clientEncryption = new ClientEncryption(keyVault, kmsProviders)

// Create encrypted field
const encryptedSSN = clientEncryption.encrypt("123-45-6789", {
  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
  keyId: dataKeyId
})

// Insert document with encrypted field
db.users.insertOne({
  name: "John Doe",
  ssn: encryptedSSN
})
```

### Auditing

**Enable Auditing** (MongoDB Enterprise):

```yaml
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.json
  filter: '{ "atype": { "$in": ["createCollection", "dropCollection"] } }'
```

## 10. Performance Monitoring and Troubleshooting

### Monitoring Tools and Metrics

**MongoDB Compass**:
- Visual performance monitoring
- Real-time server stats
- Query performance insights
- Index usage analysis

**MongoDB Cloud Manager/Ops Manager**:
- Comprehensive monitoring dashboard
- Automated backup and restore
- Performance alerts
- Capacity planning

**Built-in Monitoring Commands**:

```javascript
// Server status and metrics
db.serverStatus()
db.stats()
db.collection.stats()

// Current operations
db.currentOp()

// Database profiler
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Connection stats
db.serverStatus().connections

// Memory usage
db.serverStatus().mem
```

### Performance Diagnostics

**Slow Query Analysis**:

```javascript
// Enable profiling for slow operations
db.setProfilingLevel(1, { slowms: 100 })

// Query profiler collection
db.system.profile.find({
  "command.find": { $exists: true },
  "millis": { $gt: 1000 }
}).sort({ ts: -1 })

// Analyze query patterns
db.system.profile.aggregate([
  { $match: { "command.find": { $exists: true } } },
  { $group: {
      _id: "$command.find",
      avgDuration: { $avg: "$millis" },
      count: { $sum: 1 }
  }},
  { $sort: { avgDuration: -1 } }
])
```

**Index Usage Analysis**:

```javascript
// Check index usage statistics
db.collection.aggregate([
  { $indexStats: {} }
])

// Find unused indexes
db.runCommand({ collStats: "collection", indexDetails: true })
```

### Common Performance Issues

**Inefficient Queries**:

```javascript
// Problem: Missing indexes
db.users.find({ email: "user@example.com" }).explain()
// Solution: Add index
db.users.createIndex({ email: 1 })

// Problem: Large result sets without limits
db.products.find({})  // Returns all documents
// Solution: Use pagination
db.products.find({}).limit(20).skip(pageNumber * 20)

// Problem: Inefficient regex queries
db.users.find({ name: /.*john.*/i })  // Slow regex
// Solution: Use text index or optimize regex
db.users.createIndex({ name: "text" })
db.users.find({ $text: { $search: "john" } })
```

**Memory Issues**:

```javascript
// Monitor memory usage
db.serverStatus().mem

// Check working set size
db.serverStatus().wiredTiger.cache

// Identify memory-intensive operations
db.currentOp({ "secs_running": { $gt: 5 } })
```

### Capacity Planning

**Storage Monitoring**:

```javascript
// Database size
db.stats()

// Collection sizes
db.runCommand({ collStats: "users" })

// Index sizes
db.users.stats().indexSizes

// Growth rate analysis
db.serverStatus().metrics.document
```

**Connection Monitoring**:

```javascript
// Current connections
db.serverStatus().connections

// Connection patterns
db.currentOp({ "active": true })

// Configure connection limits
// In mongod.conf:
// net:
//   maxIncomingConnections: 1000
```

### Backup and Recovery Strategies

**Backup Methods**:

```bash
# mongodump - logical backup
mongodump --host localhost:27017 --db myapp --out /backup/location

# Restore from mongodump
mongorestore --host localhost:27017 --db myapp /backup/location/myapp

# File system snapshots (for replica sets)
# 1. Lock writes
db.fsyncLock()
# 2. Take snapshot
# 3. Unlock writes
db.fsyncUnlock()

# Continuous backup with oplog
mongodump --host localhost:27017 --oplog --out /backup/location
```

**Point-in-Time Recovery**:

```bash
# Backup with oplog
mongodump --oplog --out /backup/full

# Restore to specific point in time
mongorestore --oplogReplay --oplogLimit 1640995200:1 /backup/full
```

### Troubleshooting Common Issues

**Connection Problems**:

```javascript
// Check connection limits
db.serverStatus().connections

// Monitor failed connections
db.serverStatus().network

// Solution: Implement connection pooling in applications
// Example connection string with pooling:
// mongodb://user:pass@host:port/db?maxPoolSize=10&minPoolSize=5
```

**Replication Lag**:

```javascript
// Check replication status
rs.status()

// Monitor oplog window
db.oplog.rs.find().sort({ $natural: 1 }).limit(1)  // First entry
db.oplog.rs.find().sort({ $natural: -1 }).limit(1) // Last entry

// Solutions:
// 1. Increase oplog size
// 2. Optimize network connectivity
// 3. Reduce write load on primary
```

**Disk Space Issues**:

```bash
# Check disk usage
df -h

# Compact collections (may require downtime)
db.runCommand({ compact: "collection" })

# Clean up old log files
db.runCommand({ logRotate: 1 })

# For WiredTiger storage engine
db.runCommand({ planCacheClear: "collection" })
```

### Best Practices Summary

**Schema Design**:
- Model data based on query patterns
- Use appropriate data types
- Implement proper validation
- Consider document size limits

**Indexing**:
- Create indexes for frequent queries
- Use compound indexes strategically
- Monitor index usage regularly
- Remove unused indexes

**Operations**:
- Implement proper error handling
- Use appropriate read/write concerns
- Monitor performance continuously
- Plan for capacity growth

**Security**:
- Enable authentication and authorization
- Use TLS/SSL for network communication
- Implement field-level encryption for sensitive data
- Regular security audits

**High Availability**:
- Deploy replica sets for redundancy
- Configure appropriate write concerns
- Plan for disaster recovery
- Test failover procedures regularly

This comprehensive tutorial covers the essential aspects of MongoDB from basic operations to advanced topics like sharding and performance optimization. The key to mastering MongoDB is understanding your application's data patterns and choosing the right tools and techniques for your specific use case.