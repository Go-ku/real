import mongoose, { Schema } from "mongoose";

const PROPERTY_TYPE_VALUES = ["house", "apartment", "flat", "shop", "office", "warehouse", "land"];
const PROPERTY_STATUS_VALUES = ["vacant", "occupied", "maintenance"];

const PropertySchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // "Plot 123 - Kabulonga"
    type: { type: String, enum: PROPERTY_TYPE_VALUES, default: "house" },
    address: { type: String, required: true, trim: true },

    // Keep it simple: status can be derived from active lease later,
    // but storing helps dashboards + quick filtering.
    status: { type: String, enum: PROPERTY_STATUS_VALUES, default: "vacant" },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PropertySchema.index({ status: 1, type: 1 });
PropertySchema.index({ name: 1 });

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
