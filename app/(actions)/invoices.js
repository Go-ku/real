"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Lease, Invoice } from "@/lib/models";
import { toPeriod, makeDueDate, computeInvoiceStatus } from "@/lib/dates";

/**
 * List invoices with optional filters
 */
export async function listInvoices({ status, propertyId, tenantId } = {}) {
  await dbConnect();

  const q = {};
  if (status) q.status = status;
  if (propertyId) q.propertyId = propertyId;
  if (tenantId) q.tenantId = tenantId;

  const items = await Invoice.find(q)
    .sort({ dueDate: 1 })
    .populate("propertyId")
    .populate("tenantId")
    .lean();

  return items.map((i) => ({ ...i, _id: String(i._id) }));
}

export async function getInvoice(invoiceId) {
  await dbConnect();
  const i = await Invoice.findById(invoiceId)
    .populate("propertyId")
    .populate("tenantId")
    .populate("leaseId")
    .lean();

  if (!i) return null;
  return { ...i, _id: String(i._id) };
}

/**
 * Generate invoices for ONE lease:
 * - creates invoices from current month up to monthsAhead
 * - uses unique (leaseId, period) to prevent duplicates
 */
export async function generateInvoicesForLease(leaseId, { monthsAhead = 3 } = {}) {
  await dbConnect();

  const lease = await Lease.findById(leaseId).lean();
  if (!lease) throw new Error("Lease not found");

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0);

  const ops = [];
  for (let i = 0; i <= monthsAhead; i++) {
    const dt = new Date(start.getFullYear(), start.getMonth() + i, 1, 12, 0, 0);
    const period = toPeriod(dt);
    const dueDate = makeDueDate({ year: dt.getFullYear(), month: dt.getMonth() + 1, dueDay: lease.dueDay });

    // Base amount is rentAmount (proration later if you want)
    const amount = lease.rentAmount;

    const status = computeInvoiceStatus({ dueDate, amount, paidAmount: 0 }, now);

    ops.push({
      updateOne: {
        filter: { leaseId: lease._id, period },
        update: {
          $setOnInsert: {
            leaseId: lease._id,
            propertyId: lease.propertyId,
            tenantId: lease.tenantId,
            period,
            amount,
            dueDate,
            paidAmount: 0,
            status,
          },
        },
        upsert: true,
      },
    });
  }

  if (ops.length) await Invoice.bulkWrite(ops, { ordered: false });

  return { success: true };
}

/**
 * Generate invoices for ALL active leases (useful for cron later)
 */
export async function generateInvoicesForAllActiveLeases({ monthsAhead = 1 } = {}) {
  await dbConnect();

  const leases = await Lease.find({ status: "active" }).select("_id").lean();
  for (const l of leases) {
    await generateInvoicesForLease(String(l._id), { monthsAhead });
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true, count: leases.length };
}

/**
 * Recompute statuses (due/overdue/partial/paid) from dueDate+paidAmount+amount
 */
export async function refreshInvoiceStatuses() {
  await dbConnect();

  const now = new Date();
  const invoices = await Invoice.find({}).select("_id dueDate amount paidAmount").lean();

  const ops = invoices.map((inv) => {
    const status = computeInvoiceStatus(inv, now);
    return {
      updateOne: {
        filter: { _id: inv._id },
        update: { $set: { status } },
      },
    };
  });

  if (ops.length) await Invoice.bulkWrite(ops, { ordered: false });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return { success: true, updated: ops.length };
}

export async function updateInvoicePaidAmount(invoiceId, prevState, formData) {
  try {
    await dbConnect();

    const paidAmountRaw = String(formData.get("paidAmount") || "").trim();
    const paidAmount = Number(paidAmountRaw);

    const errors = {};
    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      errors.paidAmount = "Paid amount must be 0 or more.";
    }

    const invoice = await Invoice.findById(invoiceId).lean();
    if (!invoice) return { success: false, errors: { _form: "Invoice not found." } };

    // Safety: don’t allow paidAmount > amount (change this if you want to allow overpayment/credit)
    if (paidAmount > Number(invoice.amount || 0)) {
      errors.paidAmount = `Paid amount cannot exceed invoice total (${invoice.amount}).`;
    }

    if (Object.keys(errors).length) return { success: false, errors };

    const status = computeInvoiceStatus(
      { dueDate: invoice.dueDate, amount: invoice.amount, paidAmount },
      new Date()
    );

    await Invoice.findByIdAndUpdate(invoiceId, { paidAmount, status });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("[invoices.updatePaidAmount]", err);
    return { success: false, errors: { _form: "Failed to update paid amount." } };
  }
}