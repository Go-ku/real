"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/app/(actions)/payments";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

const initialState = { success: false, errors: {} };

function money(n) {
  const val = Number(n || 0);
  return new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(val);
}

export default function PaymentCreateForm({ properties, openInvoices, initialInvoiceId = null, initialPropertyId = null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createPayment, initialState);

  const [propertyId, setPropertyId] = React.useState(initialPropertyId ||  "");
  const [invoiceId, setInvoiceId] = React.useState(initialInvoiceId || "");

  const invoicesForProperty = React.useMemo(() => {
    if (!propertyId) return [];
    return openInvoices.filter((i) => String(i.propertyId?._id || i.propertyId) === String(propertyId));
  }, [openInvoices, propertyId]);

  const selectedInvoice = React.useMemo(() => {
    if (!invoiceId) return null;
    return openInvoices.find((i) => String(i._id) === String(invoiceId)) || null;
  }, [openInvoices, invoiceId]);

  const remaining = React.useMemo(() => {
    if (!selectedInvoice) return 0;
    const amt = Number(selectedInvoice.amount || 0);
    const paid = Number(selectedInvoice.paidAmount || 0);
    return Math.max(0, amt - paid);
  }, [selectedInvoice]);

    React.useEffect(() => {
    if (initialInvoiceId && !propertyId) {
      const inv = openInvoices.find((x) => String(x._id) === String(initialInvoiceId));
      const pid = inv?.propertyId?._id || inv?.propertyId;
      if (pid) setPropertyId(String(pid));
      setInvoiceId(String(initialInvoiceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirect after success
  React.useEffect(() => {
  if (state?.success && state?.paymentId) {
    router.push(`/payments/${state.paymentId}/receipt`);
    router.refresh();
  }
}, [state?.success, state?.paymentId, router]);


  // When user picks a property, reset invoice selection
  React.useEffect(() => {
     // Only reset if invoice doesn't belong to the chosen property
  if (!invoiceId) return;
  const inv = openInvoices.find((x) => String(x._id) === String(invoiceId));
  const invProp = String(inv?.propertyId?._id || inv?.propertyId || "");
  if (invProp && propertyId && invProp !== String(propertyId)) {
    setInvoiceId("");
  }
  }, [propertyId]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Record payment
      </Typography>

      {state?.errors?._form ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.errors._form}
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <TextField
              label="Property"
              select
              fullWidth
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <MenuItem value="" disabled>
                Select property…
              </MenuItem>
              {properties.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name} • {p.address}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Invoice"
              select
              fullWidth
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              disabled={!propertyId}
              error={!!state?.errors?.invoiceId}
              helperText={
                state?.errors?.invoiceId ||
                (propertyId
                  ? invoicesForProperty.length
                    ? " "
                    : "No open invoices for this property."
                  : "Select a property first.")
              }
            >
              <MenuItem value="" disabled>
                Select invoice…
              </MenuItem>
              {invoicesForProperty.map((inv) => (
                <MenuItem key={inv._id} value={inv._id}>
                  {inv.period} • {inv.status.toUpperCase()} • Remaining: {money(Number(inv.amount) - Number(inv.paidAmount))}
                </MenuItem>
              ))}
            </TextField>

            {selectedInvoice ? (
              <>
                <Divider />
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>{selectedInvoice.period}</Typography>
                    <Chip size="small" label={selectedInvoice.status} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Tenant: <b>{selectedInvoice.tenantId?.fullName || "—"}</b> • {selectedInvoice.tenantId?.phone || ""}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2">
                    Amount: <b>{money(selectedInvoice.amount)}</b> • Paid: <b>{money(selectedInvoice.paidAmount)}</b> • Remaining:{" "}
                    <b>{money(remaining)}</b>
                  </Typography>
                </Stack>
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/* Payment entry */}
      <Box component="form" action={action}>
        {/* invoiceId must post to server action */}
        <input type="hidden" name="invoiceId" value={invoiceId} />

        <Stack spacing={1.5}>
          <TextField
            name="amount"
            label="Payment amount (ZMW)"
            type="number"
            inputProps={{ step: "0.01", min: 0.01, max: remaining || undefined }}
            fullWidth
            disabled={!invoiceId}
            error={!!state?.errors?.amount}
            helperText={state?.errors?.amount || (invoiceId ? `Max: ${money(remaining)}` : "Select an invoice first.")}
          />

          <TextField name="method" label="Method" select defaultValue="cash" fullWidth disabled={!invoiceId}>
            {["cash", "bank", "momo", "airtel", "card", "other"].map((m) => (
              <MenuItem key={m} value={m}>
                {m.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="reference"
            label="Reference / Receipt # (optional)"
            fullWidth
            disabled={!invoiceId}
            error={!!state?.errors?.reference}
            helperText={state?.errors?.reference || " "}
          />

          <TextField
            name="paidAt"
            label="Payment date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={!invoiceId}
            error={!!state?.errors?.paidAt}
            helperText={state?.errors?.paidAt || " "}
          />

          <TextField name="note" label="Note (optional)" fullWidth multiline minRows={2} disabled={!invoiceId} />

          <Button
            type="submit"
            variant="contained"
            disabled={pending || !invoiceId}
            sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
          >
            {pending ? "Saving..." : "Save payment"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
