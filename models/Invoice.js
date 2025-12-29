import mongoose, { Schema } from "mongoose";

const INVOICE_STATUS_VALUES = ["due", "overdue", "partial", "paid"];

const InvoiceSchema = new Schema(
  {
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true, index: true },

    // Denormalize for fast filtering by property/tenant without heavy joins:
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },

    // Billing period as "YYYY-MM" (simple + sortable)
    period: { type: String, required: true, trim: true }, // e.g. "2025-12"

    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },

    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: INVOICE_STATUS_VALUES, default: "due", index: true },

    // Optional: for notes like "Prorated"
    memo: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true, index: true }, // optional external reference
  },
  { timestamps: true }
);

// Prevent duplicate invoices for a lease in the same month:
InvoiceSchema.index({ leaseId: 1, period: 1 }, { unique: true });

// Fast dashboard queries:
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ propertyId: 1, status: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1, dueDate: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
