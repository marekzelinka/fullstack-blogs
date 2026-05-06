import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, afterEach } from "vitest";

let con;
let mongoServer;

// Spin up the in-memory DB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  con = await mongoose.connect(mongoServer.getUri());
});

// Clear all data between tests to ensure isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Clean up
afterAll(async () => {
  if (con) {
    await con.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});
