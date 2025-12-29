"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Tenant, Lease, Invoice } from "@/lib/models";  

export async function listTenants({includeInactive = false} = {}) {
  await dbConnect();
   const q = includeInactive ? {} : { isActive: true };
  const items = await Tenant.find(q).sort({ createdAt: -1 }).lean();
  return items.map((t) => ({ ...t, _id: String(t._id) }));
}

export async function deactivateTenant(tenantId) {
  try {
    await dbConnect();

    await Tenant.findByIdAndUpdate(tenantId, {
      isActive: false,
      deactivatedAt: new Date(),
    });

    revalidatePath("/tenants");
    revalidatePath(`/tenants/${tenantId}`);
    return { success: true };
  } catch (err) {
    console.error("[tenants.deactivate]", err);
    return { success: false, errors: { _form: "Failed to deactivate tenant." } };
  }
}

export async function reactivateTenant(tenantId) {
  try {
    await dbConnect();

    await Tenant.findByIdAndUpdate(tenantId, {
      isActive: true,
      deactivatedAt: null,
    });

    revalidatePath("/tenants");
    revalidatePath(`/tenants/${tenantId}`);
    return { success: true };
  } catch (err) {
    console.error("[tenants.reactivate]", err);
    return { success: false, errors: { _form: "Failed to reactivate tenant." } };
  }
}


export async function getTenant(tenantId) {
  await dbConnect();
  const t = await Tenant.findById(tenantId).lean();
  if (!t) return null;
  return { ...t, _id: String(t._id) };
}

export async function createTenant(prevState, formData) {
  try {
    await dbConnect();

    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const nationalId = String(formData.get("nationalId") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const errors = {};
    if (!fullName) errors.fullName = "Full name is required";
    if (!phone) errors.phone = "Phone is required";

    if (Object.keys(errors).length) return { success: false, errors };

    const doc = await Tenant.create({
      fullName,
      phone,
      email: email || undefined,
      nationalId: nationalId || undefined,
      notes: notes || undefined,
    });

    revalidatePath("/tenants");
    return {
      success: true,
      tenantId: String(doc._id),
      tenant: {
        _id: String(doc._id),
        fullName: doc.fullName,
        phone: doc.phone,
        email: doc.email || "",
      },
    };
  } catch (err) {
    console.error("[tenants.create]", err);
    return { success: false, errors: { _form: "Failed to create tenant." } };
  }
}

export async function updateTenant(tenantId, prevState, formData) {
  try {
    await dbConnect();

    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const nationalId = String(formData.get("nationalId") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const update = {};
    if (fullName) update.fullName = fullName;
    if (phone) update.phone = phone;
    update.email = email || undefined;
    update.nationalId = nationalId || undefined;
    update.notes = notes || undefined;

    await Tenant.findByIdAndUpdate(tenantId, update);

    revalidatePath("/tenants");
    revalidatePath(`/tenants/${tenantId}`);

    return { success: true };
  } catch (err) {
    console.error("[tenants.update]", err);
    return { success: false, errors: { _form: "Failed to update tenant." } };
  }
}

export async function deleteTenant(tenantId) {
  try {
    await dbConnect();

    // Safety checks: do not delete if linked records exist
    const leaseCount = await Lease.countDocuments({ tenantId });
    if (leaseCount > 0) {
      return {
        success: false,
        errors: { _form: "Cannot delete tenant: tenant has leases. End/delete the lease first." },
      };
    }

    const invoiceCount = await Invoice.countDocuments({ tenantId });
    if (invoiceCount > 0) {
      return {
        success: false,
        errors: { _form: "Cannot delete tenant: tenant has invoices. Keep tenant for accounting history." },
      };
    }

    // Payments usually link via lease/invoice, but just in case:
    const paymentCount = await Payment.countDocuments({});
    if (paymentCount > 0) {
      // optional: skip this check if you prefer
      // leaving it permissive could be okay if payments don't store tenantId
    }

    await Tenant.findByIdAndDelete(tenantId);

    revalidatePath("/tenants");
    return { success: true };
  } catch (err) {
    console.error("[tenants.delete]", err);
    return { success: false, errors: { _form: "Failed to delete tenant." } };
  }
}
