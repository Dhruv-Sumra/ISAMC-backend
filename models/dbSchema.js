import mongoose from "mongoose";

const dbSchema = new mongoose.Schema({}, { strict: false });

export const DB = mongoose.models.DB || mongoose.model("DB", dbSchema, "db"); 