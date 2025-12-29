"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

function money(n) {
  const val = Number(n || 0);
  return new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(val);
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

export default function ReceiptClient({ payment }) {
  const invoice = payment.invoiceId;
  const tenant = invoice?.tenantId;
  const property = invoice?.propertyId;

  const receiptNo =
    payment.reference ||
    `RCPT-${String(payment._id).slice(-6).toUpperCase()}`;

  const amount = money(payment.amount);
  const paidAt = formatDate(payment.paidAt);

  const invoiceAmount = invoice ? money(invoice.amount) : "";
  const invoicePaid = invoice ? money(invoice.paidAmount) : "";
  const remaining = invoice
    ? money(Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0)))
    : "";

  return (
    <Box>
      {/* Top actions (hidden on print) */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 2,
          "@media print": { display: "none" },
        }}
      >
        <Button
          component={Link}
          href="/payments"
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderRadius: 999 }}
        >
          Payments
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={() => window.print()}
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          sx={{ borderRadius: 999, fontWeight: 800 }}
        >
          Print / Save PDF
        </Button>
      </Stack>

      {/* Receipt paper */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          "@media print": {
            border: "none",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Nyumba
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment Receipt
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 900 }}>#{receiptNo}</Typography>
              <Typography variant="body2" color="text.secondary">
                {paidAt}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Main amount */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Amount received
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {amount}
            </Typography>
          </Box>

          {/* Details */}
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Method</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {(payment.method || "cash").toUpperCase()}
              </Typography>
            </Stack>

            {payment.reference ? (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">Reference</Typography>
                <Typography sx={{ fontWeight: 700 }}>{payment.reference}</Typography>
              </Stack>
            ) : null}

            <Divider />

            <Typography sx={{ fontWeight: 900 }}>Payer</Typography>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Tenant</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {tenant?.fullName || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Phone</Typography>
              <Typography sx={{ fontWeight: 700 }}>{tenant?.phone || "—"}</Typography>
            </Stack>

            <Divider />

            <Typography sx={{ fontWeight: 900 }}>Applied to</Typography>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Property</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {property?.name || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Address</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {property?.address || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Invoice period</Typography>
              <Typography sx={{ fontWeight: 700 }}>{invoice?.period || "—"}</Typography>
            </Stack>

            {invoice ? (
              <>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary">Invoice total</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{invoiceAmount}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary">Total paid</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{invoicePaid}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary">Remaining</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{remaining}</Typography>
                </Stack>
              </>
            ) : null}

            {payment.note ? (
              <>
                <Divider />
                <Typography sx={{ fontWeight: 900 }}>Note</Typography>
                <Typography variant="body2">{payment.note}</Typography>
              </>
            ) : null}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Typography variant="caption" color="text.secondary">
            This receipt was generated by Nyumba. Keep it for your records.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
