import React, { useEffect } from "react";
import { useActionState } from "react";
import { createTenant } from "@/app/(actions)/tenants";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
} from "@mui/material";

export default function TenantCreateDialog({ open, onClose, onSuccess }) {
  
  const [state, action, pending] = useActionState(createTenant, { success: false });

  // 🔄 Listen for a successful creation
  useEffect(() => {
    if (state.success && state.tenantId) {
      onSuccess(state.tenantId); // Pass the new ID back to the Lease form
    }
  }, [state, onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Add New Tenant</DialogTitle>
      <DialogContent>
        <Stack component="form" action={action} spacing={2} sx={{ mt: 1 }}>
          <TextField name="fullName" label="Full Name" fullWidth required />
          <TextField name="phone" label="Phone Number" fullWidth required />
          <TextField name="email" label="Email" fullWidth />
          
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? "Saving..." : "Save Tenant"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}