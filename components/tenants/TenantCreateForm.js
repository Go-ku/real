"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTenant } from "@/app/(actions)/tenants";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

const initialState = { success: false, errors: {} };

export default function TenantCreateForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createTenant, initialState);

  React.useEffect(() => {
    if (state?.success && state?.tenantId) {
      router.push(`/tenants/${state.tenantId}`);
    }
  }, [state, router]);

  return (
    <Box component="form" action={action}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Add tenant
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
          fullWidth
          error={!!state?.errors?.fullName}
          helperText={state?.errors?.fullName || " "}
        />
        <TextField
          name="phone"
          label="Phone"
          fullWidth
          error={!!state?.errors?.phone}
          helperText={state?.errors?.phone || " "}
        />
        <TextField name="email" label="Email (optional)" fullWidth />
        <TextField name="nationalId" label="National ID (optional)" fullWidth />
        <TextField name="notes" label="Notes (optional)" fullWidth multiline minRows={3} />

        <Button
          type="submit"
          variant="contained"
          disabled={pending}
          sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
        >
          {pending ? "Saving..." : "Create tenant"}
        </Button>
      </Stack>
    </Box>
  );
}
