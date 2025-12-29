import mongoose, { Schema } from "mongoose";

const TenantSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    nationalId: { type: String, trim: true }, // optional (NRC/passport)
    notes: { type: String, trim: true },

    isActive: { type: Boolean, default: true, index: true },
    deactivatedAt: { type: Date },
  },
  { timestamps: true }
);

TenantSchema.index({ phone: 1 });
TenantSchema.index({ fullName: 1 });

export default mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
