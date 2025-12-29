import Link from "next/link";
import { getInvoice } from "@/app/(actions)/invoices";
import { listPayments } from "@/app/(actions)/payments";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import InvoiceActions from "@/components/invoices/InvoiceActions";
import money from "@/lib/money";

export default async function InvoiceDetailPage({ params }) {
  const { invoiceId } = await params;

  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Invoice not found
        </Typography>
      </Box>
    );
  }
  const sanitizedInvoice = JSON.parse(JSON.stringify(invoice));
  const payments = await listPayments({ invoiceId });

  
  const propertyId = invoice.propertyId?._id || invoice.propertyId;
  const remaining = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));
  const canPay = ["due", "overdue", "partial"].includes(invoice.status);

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Invoice {invoice.period}
          </Typography>
          <Chip size="small" label={invoice.status} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Due: {new Date(invoice.dueDate).toLocaleDateString()}
        </Typography>

        <Typography variant="body2">
          Amount: <b>{money(invoice.amount)}</b> • Paid: <b>{money(invoice.paidAmount)}</b> • Remaining:{" "}
          <b>{money(remaining)}</b>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Tenant: <b>{invoice.tenantId?.fullName || "—"}</b>
        </Typography>
      </Stack>

      <InvoiceActions invoice={sanitizedInvoice} />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {canPay ? (
            <Link href={`/payments/new?invoiceId=${invoice._id}&propertyId=${propertyId}`}>
              <Button
                variant="contained"
                sx={{ borderRadius: 999, fontWeight: 800 }}
              >
                Record payment
              </Button>
            </Link>
        ) : null}

        {/* {propertyId ? (
          <Link href={`/properties/${propertyId}/invoices`}>
            <Button
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 800 }}
            >
              View property invoices
            </Button>
          </Link>
        ) : null} */}
      </Stack>

      <Typography sx={{ fontWeight: 900, mb: 1 }}>Payment history</Typography>

      {payments.length === 0 ? (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>No payments yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Record a payment to update this invoice.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {payments.map((p) => (
            <Card key={p._id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 900 }}>{money(p.amount)}</Typography>
                  <Chip size="small" label={(p.method || "payment").toUpperCase()} variant="outlined" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {new Date(p.paidAt).toLocaleDateString()}
                </Typography>
                {p.reference ? (
                  <Typography variant="caption" color="text.secondary">
                    Ref: {p.reference}
                  </Typography>
                ) : null}
                {p.note ? (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {p.note}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
