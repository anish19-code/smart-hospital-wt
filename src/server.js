
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Hospital Backend is running!"
  });
});

// GET all equipment
app.get("/api/equipment", async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany();

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch equipment"
    });
  }
});


 // POST - Add new equipment
app.post("/api/equipment", async (req, res) => {
  try {
    const {
      name,
      assetTag,
      category,
      location,
      status,
      condition
    } = req.body;

    // Check required fields
    if (!name || !assetTag || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, assetTag, category, and location are required"
      });
    }

    // Save equipment in PostgreSQL
    const equipment = await prisma.equipment.create({
      data: {
        name,
        assetTag,
        category,
        location,
        status: status || "AVAILABLE",
        condition: condition || "GOOD"
      }
    });

    res.status(201).json({
      success: true,
      message: "Equipment added successfully",
      data: equipment
    });

  } catch (error) {
    console.error("Error adding equipment:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This assetTag already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add equipment"
    });
  }
});

app.post("/api/test-post", (req, res) => {
  res.json({
    success: true,
    message: "POST route is working!"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
