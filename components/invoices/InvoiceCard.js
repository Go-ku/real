import Link from "next/link";
import { Card, CardContent, Stack, Typography, Chip, Button } from "@mui/material";
import money from "@/lib/money";


export default function InvoiceCard({ invoice }) {
  const propertyId = invoice.propertyId?._id || invoice.propertyId;
  const remaining = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));

  const canPay = ["due", "overdue", "partial"].includes(invoice.status);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 900 }}>{invoice.period}</Typography>
            <Chip size="small" label={invoice.status} />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Tenant: <b>{invoice.tenantId?.fullName || "—"}</b>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
          </Typography>

          <Link href={`/invoices/${invoice._id}`}>
            <Typography variant="body2">
              Amount: <b>{money(invoice.amount)}</b> • Paid: <b>{money(invoice.paidAmount)}</b> • Remaining:{" "}
              <b>{money(remaining)}</b>
            </Typography>
          </Link>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {propertyId ? (
              <Link href={`/properties/${propertyId}/invoices`}>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  View property invoices
                </Button>
              </Link>
            ) : null}

            {canPay ? (
              <Button
                component={Link}
                href={`/payments/new?invoiceId=${invoice._id}`}
                size="small"
                variant="contained"
                sx={{ borderRadius: 999, fontWeight: 800 }}
              >
                Record payment
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
