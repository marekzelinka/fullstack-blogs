import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach } from "vitest";

let mongoServer;

beforeAll(async () => {
  // Spin up the in-memory DB
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.3", // More stable/compatible than 8.x
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clean up
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clean data between tests
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany();
    }
  }
});
