"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateInvoicePaidAmount } from "@/app/(actions)/invoices";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import money from "@/lib/money";

const initialState = { success: false, errors: {} };




export default function InvoiceActions({ invoice }) {
  const [open, setOpen] = React.useState(false);

  const [state, action, pending] = useActionState(
    (prev, formData) => updateInvoicePaidAmount(invoice._id, prev, formData),
    initialState
  );

  React.useEffect(() => {
    if (state?.success) {
      setOpen(false);
      // Server component page will revalidate, but client refresh helps immediately.
      // (Optional) window.location.reload() is heavy, so we avoid it.
    }
  }, [state?.success]);

  const remaining = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 999 }}
        >
          Adjust paid amount
        </Button>

        <form action={action}>
          <input type="hidden" name="paidAmount" value={String(invoice.amount)} />
          <Button
            type="submit"
            variant="contained"
            sx={{ borderRadius: 999, fontWeight: 800 }}
            disabled={pending}
          >
            Mark fully paid
          </Button>
        </form>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adjust paid amount</DialogTitle>

        <DialogContent>
          {state?.errors?._form ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.errors._form}
            </Alert>
          ) : null}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invoice total: <b>{money(invoice.amount)}</b> • Remaining: <b>{money(remaining)}</b>
          </Typography>

          <form id="paid-amount-form" action={action}>
            <Stack spacing={1.5}>
              <TextField
                name="paidAmount"
                label="Paid amount (ZMW)"
                type="number"
                defaultValue={invoice.paidAmount || 0}
                inputProps={{ step: "0.01", min: 0, max: invoice.amount }}
                fullWidth
                error={!!state?.errors?.paidAmount}
                helperText={state?.errors?.paidAmount || " "}
              />
            </Stack>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 999 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="paid-amount-form"
            variant="contained"
            disabled={pending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {pending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
