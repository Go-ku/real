"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateTenant } from "@/app/(actions)/tenants";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

const initialState = { success: false, errors: {} };

export default function TenantEditForm({ tenant }) {
  const router = useRouter();

  const [state, action, pending] = useActionState(
    (prev, formData) => updateTenant(tenant._id, prev, formData),
    initialState
  );

  React.useEffect(() => {
    if (state?.success) {
      router.push(`/tenants/${tenant._id}`);
      router.refresh();
    }
  }, [state?.success, router, tenant._id]);

  return (
    <Box component="form" action={action}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Edit tenant
      </Typography>

      {state?.errors?._form ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.errors._form}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <TextField
          name="fullName"
          label="Full name"
          defaultValue={tenant.fullName || ""}
          fullWidth
          error={!!state?.errors?.fullName}
          helperText={state?.errors?.fullName || " "}
        />

        <TextField
          name="phone"
          label="Phone"
          defaultValue={tenant.phone || ""}
          fullWidth
          error={!!state?.errors?.phone}
          helperText={state?.errors?.phone || " "}
        />

        <TextField
          name="email"
          label="Email (optional)"
          defaultValue={tenant.email || ""}
          fullWidth
        />

        <TextField
          name="nationalId"
          label="National ID (optional)"
          defaultValue={tenant.nationalId || ""}
          fullWidth
        />

        <TextField
          name="notes"
          label="Notes (optional)"
          defaultValue={tenant.notes || ""}
          fullWidth
          multiline
          minRows={3}
        />

        <Stack direction="row" spacing={1}>
          <Button onClick={() => router.back()} variant="text" sx={{ borderRadius: 999 }}>
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
