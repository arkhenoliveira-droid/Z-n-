## **Monorepo Structure**
```
si-mvp/
├── package.json
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── graphql/
│   │   │   │   ├── schema.graphql
│   │   │   │   └── resolvers.js
│   │   │   ├── models/
│   │   │   │   ├── Seed.js
│   │   │   │   └── Connection.js
│   │   │   ├── socket/
│   │   │   │   └── index.js
│   │   │   └── server.js
│   │   └── package.json
│   └── shared/
│       └── types.js
└── README.md
```

## **1. Root package.json**
```json
{
  "name": "si-mvp",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "yarn workspace backend dev",
    "build": "yarn workspace backend build",
    "start": "yarn workspace backend start"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

## **2. Backend Implementation**

### **packages/backend/package.json**
```json
{
  "name": "@si-mvp/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "apollo-server-express": "^3.12.1",
    "express": "^4.18.2",
    "graphql": "^16.8.1",
    "socket.io": "^4.7.4",
    "mongoose": "^7.6.3",
    "uuid": "^9.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### **packages/backend/src/models/Seed.js**
```javascript
const mongoose = require('mongoose');

const seedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }]
});

module.exports = mongoose.model('Seed', seedSchema);
```

### **packages/backend/src/models/Connection.js**
```javascript
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromSeed: { type: mongoose.Schema.Types.ObjectId, ref: 'Seed', required: true },
  toSeed: { type: mongoose.Schema.Types.ObjectId, ref: 'Seed', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Connection', connectionSchema);
```

### **packages/backend/src/graphql/schema.graphql**
```graphql
type Seed {
  id: ID!
  name: String!
  description: String
  tags: [String!]!
  createdAt: String!
}

type Connection {
  id: ID!
  fromSeed: Seed!
  toSeed: Seed!
  createdAt: String!
}

type GraphNode {
  id: ID!
  name: String!
  description: String
  tags: [String!]!
}

type GraphEdge {
  id: ID!
  source: ID!
  target: ID!
}

type Graph {
  nodes: [GraphNode!]!
  edges: [GraphEdge!]!
}

type Query {
  feed(tags: [String]): [Seed!]!
  graph(seedId: ID): Graph!
}

type Mutation {
  createSeed(name: String!, description: String, tags: [String]): Seed!
  createConnection(fromSeedId: ID!, toSeedId: ID!): Connection!
}

type Subscription {
  connectionCreated: Connection!
}
```

### **packages/backend/src/graphql/resolvers.js**
```javascript
const { GraphQLObjectType } = require('graphql');
const { withFilter } = require('graphql-subscriptions');
const { pubsub } = require('../socket');
const Seed = require('../models/Seed');
const Connection = require('../models/Connection');

const resolvers = {
  Query: {
    feed: async (_, { tags }) => {
      const query = tags && tags.length > 0 
        ? { tags: { $in: tags } } 
        : {};
      return await Seed.find(query).sort({ createdAt: -1 });
    },
    
    graph: async (_, { seedId }) => {
      // If seedId is provided, return connected component
      // Otherwise return entire graph
      let filter = {};
      if (seedId) {
        const connections = await Connection.find({
          $or: [{ fromSeed: seedId }, { toSeed: seedId }]
        });
        const seedIds = connections.reduce((acc, conn) => {
          acc.add(conn.fromSeed.toString());
          acc.add(conn.toSeed.toString());
          return acc;
        }, new Set([seedId]));
        filter = { id: { $in: Array.from(seedIds) } };
      }
      
      const seeds = await Seed.find(filter);
      const connections = await Connection.find({
        $or: [
          { fromSeed: { $in: seeds.map(s => s._id) } },
          { toSeed: { $in: seeds.map(s => s._id) } }
        ]
      });
      
      return {
        nodes: seeds.map(seed => ({
          id: seed.id,
          name: seed.name,
          description: seed.description,
          tags: seed.tags
        })),
        edges: connections.map(conn => ({
          id: conn.id,
          source: conn.fromSeed.toString(),
          target: conn.toSeed.toString()
        }))
      };
    }
  },
  
  Mutation: {
    createSeed: async (_, { name, description = '', tags = [] }) => {
      const { v4: uuidv4 } = require('uuid');
      const seed = new Seed({
        id: uuidv4(),
        name,
        description,
        tags
      });
      await seed.save();
      return seed;
    },
    
    createConnection: async (_, { fromSeedId, toSeedId }) => {
      const { v4: uuidv4 } = require('uuid');
      const connection = new Connection({
        id: uuidv4(),
        fromSeed: fromSeedId,
        toSeed: toSeedId
      });
      await connection.save();
      
      // Update seed connections
      await Seed.findByIdAndUpdate(fromSeedId, {
        $push: { connections: connection._id }
      });
      await Seed.findByIdAndUpdate(toSeedId, {
        $push: { connections: connection._id }
      });
      
      // Populate seed details for the connection
      const populatedConnection = await Connection.findById(connection.id)
        .populate('fromSeed')
        .populate('toSeed');
      
      // Emit WebSocket event
      pubsub.publish('CONNECTION_CREATED', { connectionCreated: populatedConnection });
      
      return populatedConnection;
    }
  },
  
  Subscription: {
    connectionCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['CONNECTION_CREATED']),
        (payload, variables) => {
          // You can add filtering logic here if needed
          return true;
        }
      )
    }
  }
};

module.exports = resolvers;
```

### **packages/backend/src/socket/index.js**
```javascript
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = { pubsub };
```

### **packages/backend/src/server.js**
```javascript
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const typeDefs = require('./graphql/schema.graphql');
const resolvers = require('./graphql/resolvers');
const { pubsub } = require('./socket');

async function startServer() {
  const app = express();
  app.use(cors());
  
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/si-mvp');
  console.log('Connected to MongoDB');
  
  // Setup Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
      path: '/subscriptions'
    },
    context: ({ req, connection }) => {
      return { req, connection, pubsub };
    }
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  
  // Setup HTTP server
  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Start server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/subscriptions`);
  });
}

startServer();
```

## **3. Shared Types**

### **packages/shared/types.js**
```javascript
// Shared types between frontend and backend
export type Seed = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: string;
};

export type Connection = {
  id: string;
  fromSeed: Seed;
  toSeed: Seed;
  createdAt: string;
};

export type GraphNode = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
```

## **4. Environment Setup**

Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/si-mvp
PORT=4000
```

## **5. Installation & Running**

1. **Install dependencies:**
```bash
npm install
```

2. **Start MongoDB** (make sure it's running on localhost:27017)

3. **Start the backend:**
```bash
npm run dev
```

## **6. API Endpoints**

### **GraphQL Playground**
Access at: `http://localhost:4000/graphql`

### **WebSocket**
Access at: `ws://localhost:4000/subscriptions`

### **Available Operations:**

#### **1. Create Seed**
```graphql
mutation {
  createSeed(
    name: "Artificial Intelligence"
    description: "The simulation of human intelligence by machines"
    tags: ["technology", "intelligence", "computing"]
  ) {
    id
    name
    tags
  }
}
```

#### **2. Create Connection**
```graphql
mutation {
  createConnection(
    fromSeedId: "seed-id-1"
    toSeedId: "seed-id-2"
  ) {
    id
    fromSeed {
      id
      name
    }
    toSeed {
      id
      name
    }
  }
}
```

#### **3. Feed (with optional tags filter)**
```graphql
query {
  feed(tags: ["technology"]) {
    id
    name
    description
    tags
  }
}
```

#### **4. Graph (with optional seedId)**
```graphql
query {
  graph(seedId: "seed-id-1") {
    nodes {
      id
      name
      tags
    }
    edges {
      id
      source
      target
    }
  }
}
```

#### **5. Subscription for New Connections**
```graphql
subscription {
  connectionCreated {
    id
    fromSeed {
      id
      name
    }
    toSeed {
      id
      name
    }
  }
}
```

## **7. Force-Graph Integration**

The graph query returns data in D3-force compatible format:
- `nodes`: Array of objects with `id`, `name`, `description`, `tags`
- `edges`: Array of objects with `id`, `source`, `target`

Example usage in a force-graph:
```javascript
// Fetch graph data
const { data } = await client.query({
  query: gql`
    query {
      graph {
        nodes {
          id
          name
          description
          tags
        }
        edges {
          id
          source
          target
        }
      }
    }
  `
});

// Initialize force-graph
const graph = ForceGraph()
  (document.getElementById('graph'))
  .graphData(data)
  .nodeLabel('name')
  .nodeAutoColorBy('tags');
```

## **8. Next Steps**

1. **Backend is ready** - I'll wait for your:
   - Brand/wireframes
   - Initial tag taxonomy
   - 20 demo seeds

2. **When you provide the seeds**, we can populate them using the `createSeed` mutation

3. **Testing**:
   - Create seeds and connections
   - Test the graph visualization
   - Verify real-time updates with Socket.IO

4. **Frontend** (when ready):
   - Connect to GraphQL endpoint
   - Implement force-graph visualization
   - Add real-time subscription for new connections

The backend is now ready for your seed data and testing! Let me know when you have the demo seeds ready, and I'll help populate them.
