"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/(actions)/properties";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const initialState = { success: false, errors: {} };

export default function PropertyCreateForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createProperty, initialState);

  React.useEffect(() => {
    if (state?.success && state?.propertyId) {
      router.push(`/properties/${state.propertyId}`);
    }
  }, [state, router]);

  return (
    <Box component="form" action={action}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Add property
      </Typography>

      {state?.errors?._form ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.errors._form}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <TextField
          name="name"
          label="Property name"
          placeholder="e.g. Plot 123 - Kabulonga"
          fullWidth
          error={!!state?.errors?.name}
          helperText={state?.errors?.name || " "}
        />

        <TextField
          name="type"
          label="Type"
          select
          defaultValue="house"
          fullWidth
        >
          {["house", "apartment", "flat", "shop", "office", "warehouse", "land"].map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="address"
          label="Address"
          placeholder="e.g. Lusaka, Kabulonga, ..."
          fullWidth
          error={!!state?.errors?.address}
          helperText={state?.errors?.address || " "}
        />

        <TextField
          name="notes"
          label="Notes (optional)"
          placeholder="Any quick notes…"
          fullWidth
          multiline
          minRows={3}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={pending}
          sx={{ borderRadius: 999, py: 1.2, fontWeight: 700 }}
        >
          {pending ? "Saving..." : "Create property"}
        </Button>
      </Stack>
    </Box>
  );
}
