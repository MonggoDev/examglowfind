import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import mongoose from "mongoose";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://abbabar09_db_user:examdbnewpass@ac-8rpyyoj-shard-00-00.bshvzqf.mongodb.net:27017,ac-8rpyyoj-shard-00-01.bshvzqf.mongodb.net:27017,ac-8rpyyoj-shard-00-02.bshvzqf.mongodb.net:27017/?ssl=true&replicaSet=atlas-o6l6yk-shard-0&authSource=admin&appName=examDB";
  
  if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI environment variable is not set.");
    console.log("💡 Please set MONGODB_URI in your .env file or environment variables.");
    process.exit(1);
  }

  const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ":****@");
  console.log(`🔗 Connecting to: ${maskedUri}`);

  let Doctor;
  let Review;
  let lastError = null;

  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
      connectTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB");
    lastError = null;
    
    // Schemas
    const doctorSchema = new mongoose.Schema({
      name: String,
      clinic: String,
      image: String,
    }, { collection: 'doctors' });

    const reviewSchema = new mongoose.Schema({
      treatmentId: String,
      rating: Number,
      treatmentTypes: [String],
      doctors: [String], // IDs
      isDoctorNotSure: Boolean,
      concerns: String,
      consultationReview: String,
      reviewText: String,
      beforePhotos: [String],
      afterPhotos: [String],
      reviewerInfo: {
        gender: String,
        age: String,
        skinType: String
      },
      createdAt: { type: Date, default: Date.now }
    });

    Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
    Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

    console.log("Registered Mongoose Models:", mongoose.modelNames());
    
    // Startup Check
    const count = await Doctor.countDocuments();
    console.log(`🚀 Startup - Found ${count} doctors in database.`);
    if (count === 0) {
      console.log("🚀 Startup - Seeding initial doctors...");
      const seed = [
        { name: "Dr. Ana Garcia", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_ana/100/100" },
        { name: "Dr. Kim", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_kim/100/100" },
        { name: "Dr. Park", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_park/100/100" },
        { name: "Dr. Lee", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_lee/100/100" },
        { name: "Dr. Kang Dongwon", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_kang/100/100" },
        { name: "Dr. Jane", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_jane/100/100" }
      ];
      await Doctor.insertMany(seed);
      console.log("🚀 Startup - Seeding complete.");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    lastError = error.message || String(error);
    // Fallback models if connection fails initially
    const doctorSchema = new mongoose.Schema({ name: String, clinic: String, image: String }, { collection: 'doctors' });
    const reviewSchema = new mongoose.Schema({ treatmentId: String, rating: Number, treatmentTypes: [String], doctors: [String], isDoctorNotSure: Boolean, concerns: String, consultationReview: String, reviewText: String, beforePhotos: [String], afterPhotos: [String], reviewerInfo: { gender: String, age: String, skinType: String }, createdAt: { type: Date, default: Date.now } });
    Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
    Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
  }

  // Disable buffering to avoid long hangs if connection fails
  mongoose.set('bufferCommands', false);

  app.use(cors());
  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState,
      models: mongoose.modelNames(),
      error: lastError,
      uri: maskedUri
    });
  });

  // API Endpoints
  app.get("/api/doctors", async (req, res) => {
    console.log("GET /api/doctors - Connection State:", mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected. Please check your connection string." });
    }
    try {
      const doctors = await Doctor.find();
      console.log(`GET /api/doctors - Found ${doctors.length} doctors`);
      if (doctors.length > 0) {
        console.log("GET /api/doctors - Sample doctor:", JSON.stringify(doctors[0]));
      }
      // Seed if empty
      if (doctors.length === 0) {
        console.log("GET /api/doctors - Seeding database...");
        const seed = [
          { name: "Dr. Ana Garcia", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_ana/100/100" },
          { name: "Dr. Kim", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_kim/100/100" },
          { name: "Dr. Park", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_park/100/100" },
          { name: "Dr. Lee", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_lee/100/100" },
          { name: "Dr. Kang Dongwon", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_kang/100/100" },
          { name: "Dr. Jane", clinic: "Velasco Medical Aesthetics", image: "https://picsum.photos/seed/dr_jane/100/100" }
        ];
        const inserted = await Doctor.insertMany(seed);
        console.log(`GET /api/doctors - Seeded ${inserted.length} doctors`);
        return res.json(inserted);
      }
      res.json(doctors);
    } catch (error) {
      console.error("GET /api/doctors - Error:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/pending", (req, res) => {
    // Mock pending reviews for now
    res.json([
      {
        id: "1",
        title: "VMA HYDRATING GLASS FACIAL",
        clinic: "Velasco Medical Aesthetics",
        date: "2026-02-28",
        image: "https://picsum.photos/seed/skin1/100/100"
      }
    ]);
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = new Review(req.body);
      await review.save();
      res.status(201).json(review);
    } catch (error) {
      console.error("Error saving review:", error);
      res.status(400).json({ error: "Failed to save review" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
