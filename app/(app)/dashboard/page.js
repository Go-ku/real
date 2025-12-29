import Link from "next/link";
import { getDashboardSummary } from "@/app/(actions)/dashboard";
import { listInvoices } from "@/app/(actions)/invoices";
import { Box, Button, Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import money from "@/lib/money";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const invoices = await listInvoices({});
  const overdue = invoices.filter((i) => i.status === "overdue").slice(0, 6);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Dashboard
      </Typography>

      <Stack spacing={1.25} sx={{ mb: 2 }}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Open invoices</Typography>
              <Chip label={summary.dueCount} />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Overdue</Typography>
              <Chip label={summary.overdueCount} />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Paid this month</Typography>
              <Typography sx={{ fontWeight: 900 }}>{money(summary.paidThisMonth)}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 900 }}>Overdue invoices</Typography>
        <Link href="/invoices" >
          <Button  variant="text" sx={{ borderRadius: 999 }}>
          View all
        </Button>
        </Link>
      </Stack>

      <Stack spacing={1.25}>
        {overdue.map((inv) => (
          <Card key={inv._id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 900 }}>{inv.period}</Typography>
                <Chip size="small" label="overdue" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {inv.tenantId?.fullName || "—"} • Due {new Date(inv.dueDate).toLocaleDateString()}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Link href={`/payments/new?invoiceId=${inv._id}`}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ borderRadius: 999, fontWeight: 800 }}
                  >
                    Record payment
                  </Button>
                </Link>
                <Link href={`/properties/${inv.propertyId?._id || inv.propertyId}`}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 999 }}
                  >
                    Property
                  </Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {overdue.length === 0 ? (
        <Box sx={{ mt: 2, p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>No overdue invoices 🎉</Typography>
          <Typography variant="body2" color="text.secondary">
            You’re all caught up.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
