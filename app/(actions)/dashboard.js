"use server";

import { dbConnect } from "@/lib/db";
import { Invoice, Payment } from "@/lib/models";

export async function getDashboardSummary() {
  await dbConnect();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  const [dueCount, overdueCount, paidThisMonthAgg] = await Promise.all([
    Invoice.countDocuments({ status: { $in: ["due", "partial"] } }),
    Invoice.countDocuments({ status: "overdue" }),
    Payment.aggregate([
      { $match: { paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const paidThisMonth = paidThisMonthAgg?.[0]?.total || 0;

  return {
    dueCount,
    overdueCount,
    paidThisMonth,
  };
}
