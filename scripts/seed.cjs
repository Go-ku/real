/* eslint-disable no-console */
require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");

const Property = require("../models/Property").default || require("../models/Property");
const Tenant = require("../models/Tenant").default || require("../models/Tenant");
const Lease = require("../models/Lease").default || require("../models/Lease");
const Invoice = require("../models/Invoice").default || require("../models/Invoice");
const Payment = require("../models/Payment").default || require("../models/Payment");

const dates = require("../lib/dates");
const { is } = require("zod/v4/locales");
const { toPeriod, makeDueDate, computeInvoiceStatus } = dates;

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// 🔴 set to false if you don’t want to wipe data
const RESET_DB = true;

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  if (RESET_DB) {
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Payment.deleteMany({}),
      Invoice.deleteMany({}),
      Lease.deleteMany({}),
      Tenant.deleteMany({}),
      Property.deleteMany({}),
    ]);
  }

  const properties = await Property.insertMany([
    { name: "Kabulonga House", type: "house", address: "Kabulonga, Lusaka", status: "occupied" },
    { name: "Ibex Flats – Unit 2", type: "flat", address: "Ibex Hill, Lusaka", status: "occupied" },
    { name: "Chilenje Shop", type: "shop", address: "Chilenje South", status: "vacant" },
  ]);
  console.log(`🏠 Created ${properties.length} properties`);

  const tenants = await Tenant.insertMany([
    { fullName: "John Banda", phone: "0977000001", email: "john@example.com", isActive: true },
    { fullName: "Mary Phiri", phone: "0966000002", email: "mary@example.com", isActive: true },
  ]);
  console.log(`👤 Created ${tenants.length} tenants`);

  const leases = [];
  leases.push(
    await Lease.create({
      propertyId: properties[0]._id,
      tenantId: tenants[0]._id,
      startDate: monthsAgo(5),
      rentAmount: 8000,
      dueDay: 5,
      depositAmount: 8000,
      status: "active",
      leaseRef: "KAB-HSE-001",
    })
  );

  leases.push(
    await Lease.create({
      propertyId: properties[1]._id,
      tenantId: tenants[1]._id,
      startDate: monthsAgo(3),
      rentAmount: 6000,
      dueDay: 10,
      depositAmount: 6000,
      status: "active",
      leaseRef: "IBEX-002",
    })
  );
  console.log(`📄 Created ${leases.length} leases`);

  const invoices = [];
  for (const lease of leases) {
    for (let i = 4; i >= 0; i--) {
      const date = monthsAgo(i);
      const period = toPeriod(date);
      const dueDate = makeDueDate({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        dueDay: lease.dueDay,
      });

      const inv = await Invoice.create({
        leaseId: lease._id,
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        period,
        amount: lease.rentAmount,
        dueDate,
        paidAmount: 0,
        status: "due",
        invoiceNumber: `INV-${new Date().toString().slice(-6)}-${period.replace("-", "")}`,
        reference: `INV-${lease._id.toString().slice(-6)}-${period.replace("-", "")}`,
      });

      invoices.push(inv);
    }
  }
  console.log(`🧾 Created ${invoices.length} invoices`);

  for (const invoice of invoices) {
    const now = new Date();
    const ageInMonths =
      (now.getFullYear() - invoice.dueDate.getFullYear()) * 12 + (now.getMonth() - invoice.dueDate.getMonth());

    if (ageInMonths >= 2) {
      await Payment.create({
        invoiceId: invoice._id,
        leaseId: invoice.leaseId,
        amount: invoice.amount,
        method: "bank",
        reference: `BANK-${invoice._id.toString().slice(-6)}`,
        paidAt: new Date(invoice.dueDate),
      });
      invoice.paidAmount = invoice.amount;
    }

    if (ageInMonths === 1) {
      const partial = invoice.amount / 2;
      await Payment.create({
        invoiceId: invoice._id,
        leaseId: invoice.leaseId,
        amount: partial,
        method: "momo",
        reference: `MOMO-${invoice._id.toString().slice(-6)}`,
        paidAt: new Date(invoice.dueDate),
      });
      invoice.paidAmount = partial;
    }

    invoice.status = computeInvoiceStatus(
      { dueDate: invoice.dueDate, amount: invoice.amount, paidAmount: invoice.paidAmount },
      new Date()
    );
    await invoice.save();
  }

  console.log("💰 Payments seeded");
  console.log("✅ SEED COMPLETE");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
