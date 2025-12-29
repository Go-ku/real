"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateLease } from "@/app/(actions)/leases";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

const initialState = { success: false, errors: {} };

export default function LeaseEditForm({ lease }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    (prev, formData) => updateLease(lease._id, prev, formData),
    initialState
  );

  React.useEffect(() => {
    if (state?.success) {
      router.push(`/properties/${lease.propertyId}`);
      router.refresh();
    }
  }, [state?.success, router, lease.propertyId]);

  return (
    <Box component="form" action={action}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Edit lease
      </Typography>

      {state?.errors?._form ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.errors._form}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <TextField
          name="startDate"
          label="Start date"
          type="date"
          defaultValue={new Date(lease.startDate).toISOString().slice(0, 10)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!state?.errors?.startDate}
          helperText={state?.errors?.startDate || " "}
        />

        <TextField
          name="rentAmount"
          label="Monthly rent (ZMW)"
          type="number"
          defaultValue={lease.rentAmount}
          inputProps={{ step: "0.01" }}
          fullWidth
          error={!!state?.errors?.rentAmount}
          helperText={state?.errors?.rentAmount || " "}
        />

        <TextField
          name="dueDay"
          label="Rent due day (1–28)"
          type="number"
          defaultValue={lease.dueDay}
          inputProps={{ min: 1, max: 28 }}
          fullWidth
          error={!!state?.errors?.dueDay}
          helperText={state?.errors?.dueDay || " "}
        />

        <TextField
          name="depositAmount"
          label="Deposit (optional)"
          type="number"
          defaultValue={lease.depositAmount || 0}
          inputProps={{ step: "0.01" }}
          fullWidth
          error={!!state?.errors?.depositAmount}
          helperText={state?.errors?.depositAmount || " "}
        />

        <TextField
          name="notes"
          label="Notes (optional)"
          defaultValue={lease.notes || ""}
          fullWidth
          multiline
          minRows={3}
        />

        <Stack direction="row" spacing={1}>
          <Button
            type="button"
            variant="text"
            onClick={() => router.back()}
            sx={{ borderRadius: 999 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
