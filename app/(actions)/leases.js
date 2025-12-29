"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Property, Lease } from "@/lib/models";
import { generateInvoicesForLease } from "./invoices";

export async function listLeases({ status } = {}) {
  await dbConnect();
  const query = status ? { status } : {};
  const items = await Lease.find(query)
    .sort({ createdAt: -1 })
    .populate("propertyId")
    .populate("tenantId")
    .lean();

  return items.map((l) => ({ ...l, _id: String(l._id) }));
}

export async function getLease(leaseId) {
  await dbConnect();
  const l = await Lease.findById(leaseId).populate("propertyId").populate("tenantId").lean();
  if (!l) return null;
  return { ...l, _id: String(l._id) };
}

/**
 * Create an ACTIVE lease.
 * Enforced by partial unique index: one active lease per property.
 */
export async function createLease(prevState, formData) {
  try {
    await dbConnect();

    const propertyId = String(formData.get("propertyId") || "").trim();
    const tenantId = String(formData.get("tenantId") || "").trim();
    const startDateRaw = String(formData.get("startDate") || "").trim();
    const rentAmountRaw = String(formData.get("rentAmount") || "").trim();
    const dueDayRaw = String(formData.get("dueDay") || "").trim();
    const depositRaw = String(formData.get("depositAmount") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const errors = {};
    if (!propertyId) errors.propertyId = "Property is required";
    if (!tenantId) errors.tenantId = "Tenant is required";
    if (!startDateRaw) errors.startDate = "Start date is required";

    const rentAmount = Number(rentAmountRaw);
    if (!Number.isFinite(rentAmount) || rentAmount <= 0) errors.rentAmount = "Enter a valid rent amount";

    const dueDay = Number(dueDayRaw);
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) errors.dueDay = "Due day must be 1–28";

    const depositAmount = depositRaw ? Number(depositRaw) : 0;
    if (!Number.isFinite(depositAmount) || depositAmount < 0) errors.depositAmount = "Deposit must be 0 or more";

    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    if (startDateRaw && isNaN(startDate.getTime())) errors.startDate = "Invalid start date";

    if (Object.keys(errors).length) return { success: false, errors };

    const doc = await Lease.create({
      propertyId,
      tenantId,
      startDate,
      rentAmount,
      dueDay,
      depositAmount,
      status: "active",
      notes: notes || undefined,
    });

    // Update property status
    await Property.findByIdAndUpdate(propertyId, { status: "occupied" });

    // Generate invoices for the lease (e.g. current month + next few months)
    await generateInvoicesForLease(String(doc._id), { monthsAhead: 3 });

    revalidatePath("/leases");
    revalidatePath(`/leases/${doc._id}`);
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/invoices");

    return { success: true, leaseId: String(doc._id) };
  } catch (err) {
    // Common: duplicate key because property already has active lease
    if (err?.code === 11000) {
      return {
        success: false,
        errors: { propertyId: "This property already has an active lease. End it first." },
      };
    }
    console.error("[leases.create]", err);
    return { success: false, errors: { _form: "Failed to create lease." } };
  }
}


export async function listLeasesByTenant(tenantId) {
  await dbConnect();
  const items = await Lease.find({ tenantId })
    .sort({ createdAt: -1 })
    .populate("propertyId")
    .lean();

  return items.map((l) => ({ ...l, _id: String(l._id) }));
}

export async function endLease(leaseId, prevState, formData) {
  try {
    await dbConnect();

    const endDateRaw = String(formData.get("endDate") || "").trim();
    const endDate = endDateRaw ? new Date(endDateRaw) : new Date();
    if (isNaN(endDate.getTime())) {
      return { success: false, errors: { endDate: "Invalid end date" } };
    }

    const lease = await Lease.findById(leaseId).lean();
    if (!lease) return { success: false, errors: { _form: "Lease not found" } };

    await Lease.findByIdAndUpdate(leaseId, { status: "ended", endDate });

    // Set property vacant (simple v1 rule)
    await Property.findByIdAndUpdate(String(lease.propertyId), { status: "vacant" });

    revalidatePath("/leases");
    revalidatePath(`/leases/${leaseId}`);
    revalidatePath(`/properties/${lease.propertyId}`);
    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/invoices");

    return { success: true };
  } catch (err) {
    console.error("[leases.end]", err);
    return { success: false, errors: { _form: "Failed to end lease." } };
  }
}

export async function getActiveLeaseByProperty(propertyId) {
  await dbConnect();
  const lease = await Lease.findOne({ propertyId, status: "active" })
    .populate("tenantId")
    .populate("propertyId")
    .lean();

  if (!lease) return null;
  return { ...lease, _id: String(lease._id) };
}

export async function updateLease(leaseId, prevState, formData) {
  try {
    await dbConnect();

    const rentAmountRaw = String(formData.get("rentAmount") || "").trim();
    const dueDayRaw = String(formData.get("dueDay") || "").trim();
    const depositRaw = String(formData.get("depositAmount") || "").trim();
    const startDateRaw = String(formData.get("startDate") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const errors = {};

    const rentAmount = Number(rentAmountRaw);
    if (!Number.isFinite(rentAmount) || rentAmount <= 0) errors.rentAmount = "Enter a valid rent amount";

    const dueDay = Number(dueDayRaw);
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) errors.dueDay = "Due day must be 1–28";

    const depositAmount = depositRaw ? Number(depositRaw) : 0;
    if (!Number.isFinite(depositAmount) || depositAmount < 0) errors.depositAmount = "Deposit must be 0 or more";

    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    if (startDateRaw && isNaN(startDate.getTime())) errors.startDate = "Invalid start date";

    if (Object.keys(errors).length) return { success: false, errors };

    const lease = await Lease.findByIdAndUpdate(
      leaseId,
      {
        rentAmount,
        dueDay,
        depositAmount,
        startDate,
        notes: notes || undefined,
      },
      { new: true }
    ).lean();

    if (!lease) return { success: false, errors: { _form: "Lease not found." } };

    revalidatePath(`/leases/${leaseId}`);
    revalidatePath(`/leases/${leaseId}/edit`);
    revalidatePath(`/properties/${lease.propertyId}`);
    revalidatePath("/properties");
    revalidatePath("/dashboard");
    revalidatePath("/invoices");

    return { success: true };
  } catch (err) {
    console.error("[leases.update]", err);
    return { success: false, errors: { _form: "Failed to update lease." } };
  }
}

/**
 * Delete lease (safe v1): only if no invoices exist for it.
 * This avoids breaking historical accounting.
 */
export async function deleteLease(leaseId) {
  try {
    await dbConnect();

    const lease = await Lease.findById(leaseId).lean();
    if (!lease) return { success: false, errors: { _form: "Lease not found." } };

    const invoiceCount = await Invoice.countDocuments({ leaseId: lease._id });
    if (invoiceCount > 0) {
      return {
        success: false,
        errors: { _form: "Cannot delete: this lease already has invoices. End it instead." },
      };
    }

    // Extra safety (if you ever create payments without invoices, etc.)
    const paymentCount = await Payment.countDocuments({ leaseId: lease._id });
    if (paymentCount > 0) {
      return {
        success: false,
        errors: { _form: "Cannot delete: this lease already has payments. End it instead." },
      };
    }

    await Lease.findByIdAndDelete(leaseId);

    // If it was active, set property vacant
    if (lease.status === "active") {
      await Property.findByIdAndUpdate(String(lease.propertyId), { status: "vacant" });
    }

    revalidatePath("/leases");
    revalidatePath(`/properties/${lease.propertyId}`);
    revalidatePath("/properties");
    revalidatePath("/dashboard");

    return { success: true, propertyId: String(lease.propertyId) };
  } catch (err) {
    console.error("[leases.delete]", err);
    return { success: false, errors: { _form: "Failed to delete lease." } };
  }
}