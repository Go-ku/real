import mongoose, { Schema } from "mongoose";

const LEASE_STATUS_VALUES = ["active", "ended"];

const LeaseSchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date }, // optional until ended

    rentAmount: { type: Number, required: true, min: 0 },
    dueDay: { type: Number, required: true, min: 1, max: 28 }, // 1–28 avoids month-length issues
    depositAmount: { type: Number, default: 0, min: 0 },
    leaseRef: { type: String, trim: true }, // optional internal reference code 
    status: { type: String, enum: LEASE_STATUS_VALUES, default: "active", index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

/**
 * Only ONE active lease per property.
 * MongoDB supports partial unique indexes. This is perfect for “simple now, scalable later”.
 */
LeaseSchema.index(
  { propertyId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);
LeaseSchema.index(
  { leaseRef: 1 },
  {
    unique: true,
    partialFilterExpression: { leaseRef: { $type: "string" } },
  }
);

LeaseSchema.index({ tenantId: 1, status: 1 });

export default mongoose.models.Lease || mongoose.model("Lease", LeaseSchema);
