"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createLease } from "@/app/(actions)/leases";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { startTransition } from "react";  
import TenantCreateDialog from "../tenants/TenantCreateDialog";
const initialState = { success: false, errors: {} };



export default function LeaseCreateForm({ propertyId, tenants }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createLease, initialState);
const [isTenantModalOpen, setIsTenantModalOpen] = React.useState(false);
  const [selectedTenantId, setSelectedTenantId] = React.useState(null);

  React.useEffect(() => {
    if (state?.success && state?.leaseId) {
      router.push(`/properties/${propertyId}`);
    }
  }, [state, router, propertyId]);

  const handleTenantCreated = (tenantId) => {
    setIsTenantModalOpen(false);
    startTransition(() => {
      router.refresh(); // 2. Get the new tenant list from the server
      setSelectedTenantId(tenantId); // 3. Auto-select the new ID
    });
  };

  return (
    <Box>
      <Box component="form" action={action}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Create lease
        </Typography>

        <input type="hidden" name="propertyId" value={propertyId} />

        {state?.errors?._form ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.errors._form}
          </Alert>
        ) : null}

        <Stack spacing={1.5}>
          <TextField
            name="tenantId"
            label="Tenant"
            value={selectedTenantId || ""}
            select
            fullWidth
            onChange={(e) => setSelectedTenantId(e.target.value)}
            error={!!state?.errors?.tenantId}
            helperText={state?.errors?.tenantId || " "}
          >
            <MenuItem value="" disabled>
              Select tenant…
            </MenuItem>
            {tenants.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.fullName} • {t.phone}
              </MenuItem>
            ))}
            <MenuItem 
    onClick={() => setIsTenantModalOpen(true)} 
    sx={{ color: 'primary.main', fontWeight: 600, borderTop: '1px solid', borderColor: 'divider', mt: 1 }}
  >
    + Create New Tenant
  </MenuItem>
          </TextField>

          <TextField
            name="startDate"
            label="Start date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!state?.errors?.startDate}
            helperText={state?.errors?.startDate || " "}
          />

          <TextField
            name="rentAmount"
            label="Monthly rent (ZMW)"
            type="number"
            inputProps={{ step: "0.01" }}
            fullWidth
            error={!!state?.errors?.rentAmount}
            helperText={state?.errors?.rentAmount || " "}
          />

          <TextField
            name="dueDay"
            label="Rent due day (1–28)"
            type="number"
            inputProps={{ min: 1, max: 28 }}
            fullWidth
            error={!!state?.errors?.dueDay}
            helperText={state?.errors?.dueDay || " "}
          />

          <TextField
            name="depositAmount"
            label="Deposit (optional)"
            type="number"
            inputProps={{ step: "0.01" }}
            fullWidth
            error={!!state?.errors?.depositAmount}
            helperText={state?.errors?.depositAmount || " "}
          />

          <TextField
            name="notes"
            label="Notes (optional)"
            fullWidth
            multiline
            minRows={3}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
          >
            {pending ? "Creating..." : "Create lease + generate invoices"}
          </Button>
        </Stack>
      </Box>
      <TenantCreateDialog 
  open={isTenantModalOpen} 
  onClose={() => setIsTenantModalOpen(false)}
  onSuccess={handleTenantCreated}
/>
    </Box>
  );
}
