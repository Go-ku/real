import mongoose, { Schema } from "mongoose";

const PAYMENT_METHOD_VALUES = ["cash", "bank", "momo", "airtel", "card", "other"];

const PaymentSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },

    // Denormalize: makes payment history queries faster
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true, index: true },

    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: PAYMENT_METHOD_VALUES, default: "cash" },

    reference: { type: String, trim: true }, // MoMo ref, bank ref, receipt number etc.
    paidAt: { type: Date, default: Date.now, index: true },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// If you use reference numbers, enforce uniqueness when present:
PaymentSchema.index(
  { reference: 1 },
  { unique: true, partialFilterExpression: { reference: { $type: "string" } } }
);

PaymentSchema.index({ invoiceId: 1, paidAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
