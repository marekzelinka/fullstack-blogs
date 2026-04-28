import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, afterEach } from "vitest";

let mongoServer;

// Spin up the in-memory DB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.3", // More stable/compatible than 8.x
    },
  });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
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
  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
