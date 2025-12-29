"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Property } from "@/lib/models";

export async function listProperties() {
  await dbConnect();
  const items = await Property.find({}).sort({ createdAt: -1 }).lean();
  return items.map((p) => ({ ...p, _id: String(p._id) }));
}

export async function getProperty(propertyId) {
  await dbConnect();
  const p = await Property.findById(propertyId).lean();
  if (!p) return null;
  return { ...p, _id: String(p._id) };
}

export async function createProperty(prevState, formData) {
  try {
    await dbConnect();

    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "house").trim();
    const address = String(formData.get("address") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const errors = {};
    if (!name) errors.name = "Property name is required";
    if (!address) errors.address = "Address is required";

    if (Object.keys(errors).length) return { success: false, errors };

    const doc = await Property.create({
      name,
      type,
      address,
      notes: notes || undefined,
      status: "vacant",
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard");

    return { success: true, propertyId: String(doc._id) };
  } catch (err) {
    console.error("[properties.create]", err);
    return { success: false, errors: { _form: "Failed to create property." } };
  }
}

export async function updateProperty(propertyId, prevState, formData) {
  try {
    await dbConnect();

    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "house").trim();
    const address = String(formData.get("address") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const update = {};
    if (name) update.name = name;
    if (type) update.type = type;
    if (address) update.address = address;
    if (status) update.status = status;
    update.notes = notes || undefined;

    await Property.findByIdAndUpdate(propertyId, update);

    revalidatePath("/properties");
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("[properties.update]", err);
    return { success: false, errors: { _form: "Failed to update property." } };
  }
}

export async function deleteProperty(propertyId) {
  try {
    await dbConnect();
    await Property.findByIdAndDelete(propertyId);

    revalidatePath("/properties");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("[properties.delete]", err);
    return { success: false, errors: { _form: "Failed to delete property." } };
  }
}
