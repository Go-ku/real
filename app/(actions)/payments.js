"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Invoice, Payment } from "@/lib/models";
import { computeInvoiceStatus } from "@/lib/dates";

export async function listPayments({ invoiceId } = {}) {
  await dbConnect();

  const q = invoiceId ? { invoiceId } : {};
  const items = await Payment.find(q)
    .sort({ paidAt: -1 })
    .populate({
      path: "invoiceId",
      populate: [
        { path: "tenantId" },
        { path: "propertyId" },
      ],
    })
    .lean();

  return items.map((p) => ({ ...p, _id: String(p._id) }));
}

export async function createPayment(prevState, formData) {
  try {
    await dbConnect();

    const invoiceId = String(formData.get("invoiceId") || "").trim();
    const amountRaw = String(formData.get("amount") || "").trim();
    const method = String(formData.get("method") || "cash").trim();
    const reference = String(formData.get("reference") || "").trim();
    const paidAtRaw = String(formData.get("paidAt") || "").trim();
    const note = String(formData.get("note") || "").trim();

    const errors = {};
    if (!invoiceId) errors.invoiceId = "Invoice is required";

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = "Enter a valid amount";

    let paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();
    if (paidAtRaw && isNaN(paidAt.getTime())) errors.paidAt = "Invalid date";

    if (Object.keys(errors).length) return { success: false, errors };

    const invoice = await Invoice.findById(invoiceId).lean();
    if (!invoice) return { success: false, errors: { invoiceId: "Invoice not found" } };

    const newPaidAmount = Number(invoice.paidAmount || 0) + amount;

    // Prevent overpayment (simple rule; you can allow overpayment later if you want)
    if (newPaidAmount > invoice.amount) {
      return {
        success: false,
        errors: { amount: `Payment exceeds invoice balance. Remaining: ${invoice.amount - (invoice.paidAmount || 0)}` },
      };
    }

    // Create payment first (reference uniqueness is enforced by index if provided)
    const pay = await Payment.create({
      invoiceId: invoice._id,
      leaseId: invoice.leaseId,
      amount,
      method,
      reference: reference || undefined,
      paidAt,
      note: note || undefined,
    });

    // Update invoice paidAmount + status
    const updatedPaidAmount = newPaidAmount;
    const status = computeInvoiceStatus(
      { dueDate: invoice.dueDate, amount: invoice.amount, paidAmount: updatedPaidAmount },
      new Date()
    );

    await Invoice.findByIdAndUpdate(invoiceId, { paidAmount: updatedPaidAmount, status });

    revalidatePath("/payments");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/dashboard");

    return { success: true, paymentId: String(pay._id) };
  } catch (err) {
    if (err?.code === 11000) {
      return { success: false, errors: { reference: "Reference/receipt number already exists." } };
    }
    console.error("[payments.create]", err);
    return { success: false, errors: { _form: "Failed to record payment." } };
  }
}

export async function getPayment(paymentId) {
  await dbConnect();

  const p = await Payment.findById(paymentId)
    .populate({
      path: "invoiceId",
      populate: [{ path: "tenantId" }, { path: "propertyId" }],
    })
    .lean();

  if (!p) return null;
  return { ...p, _id: String(p._id) };
}
