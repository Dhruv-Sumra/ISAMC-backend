import express from "express";
import { DB } from "../models/dbSchema.js";

const router = express.Router();

const fetchSection = async (sectionName) => {
  try {
    const document = await DB.findOne({});
    return document?.[sectionName] || null;
  } catch (error) {
    console.error(`Error fetching ${sectionName}:`, error);
    throw error;
  }
};

router.get("/get-database", async (req, res) => {
  try {
    const data = await DB.findOne({});
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching DB data",
      error: error.message 
    });
  }
});

router.get("/home-mission", async (req, res) => {
  try {
    const missionData = await fetchSection("Mission");
    res.status(200).json({ success: true, data: missionData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching mission data",
      error: error.message 
    });
  }
});

router.get("/featured-events", async (req, res) => {
  try {
    const data = await fetchSection("Events");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching featured events",
      error: error.message 
    });
  }
});

router.get("/member-benefits", async (req, res) => {
  try {
    const data = await fetchSection("Member");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching member benefits",
      error: error.message 
    });
  }
});

router.get("/publications", async (req, res) => {
  try {
    const data = await fetchSection("Publications");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching publications",
      error: error.message 
    });
  }
});

router.get("/partners", async (req, res) => {
  try {
    const data = await fetchSection("partners");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/latest-news", async (req, res) => {
  try {
    const data = await fetchSection("News");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/vision", async (req, res) => {
  try {
    const data = await fetchSection("aboutMission");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/leadership", async (req, res) => {
  try {
    const data = await fetchSection("leadership");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching leadership",
      error: error.message 
    });
  }
});

router.get("/member-tiers", async (req, res) => {
  try {
    const data = await fetchSection("tier");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching member tiers",
      error: error.message 
    });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const data = await fetchSection("Testimonials");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching testimonials",
      error: error.message 
    });
  }
});

router.get("/upcoming-events", async (req, res) => {
  try {
    const data = await fetchSection("upevents");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/past-events", async (req, res) => {
  try {
    const data = await fetchSection("pastEvents");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/features-benefits", async (req, res) => {
  try {
    const data = await fetchSection("features");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/events-archives", async (req, res) => {
  try {
    const data = await fetchSection("eventsArchives");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/generals", async (req, res) => {
  try {
    const data = await fetchSection("generals");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/resources", async (req, res) => {
  try {
    const data = await fetchSection("resourceCards");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/case-studies", async (req, res) => {
  try {
    const data = await fetchSection("caseStudy");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get('/other-events', async (req, res) => {
  try {
    const data = await fetchSection('otherEvents');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch other AM events.' });
  }
});

export default router;