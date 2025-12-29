"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteTenant, deactivateTenant, reactivateTenant } from "@/app/(actions)/tenants";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

const initialState = { success: false, errors: {} };

export default function TenantActions({ tenantId, isActive }) {
  const router = useRouter();
  const [openDel, setOpenDel] = React.useState(false);

  const [delState, delAction, delPending] = useActionState(async () => {
    const res = await deleteTenant(tenantId);
    return res?.success ? { success: true } : res;
  }, initialState);

  const [toggleState, toggleAction, togglePending] = useActionState(async () => {
    const res = isActive ? await deactivateTenant(tenantId) : await reactivateTenant(tenantId);
    return res?.success ? { success: true } : res;
  }, initialState);

  React.useEffect(() => {
    if (toggleState?.success) {
      router.refresh();
    }
  }, [toggleState?.success, router]);

  React.useEffect(() => {
    if (delState?.success) {
      setOpenDel(false);
      router.push("/tenants");
      router.refresh();
    }
  }, [delState?.success, router]);

  return (
    <>
      {toggleState?.errors?._form ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {toggleState.errors._form}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
       <Link href={`/tenants/${tenantId}/edit`}>
          <Button
          
          variant="outlined"
          sx={{ borderRadius: 999 }}
        >
          Edit tenant
        </Button>
       </Link>

        <form action={toggleAction}>
          <Button
            type="submit"
            variant="contained"
            color={isActive ? "warning" : "success"}
            disabled={togglePending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {togglePending ? "Saving..." : isActive ? "Deactivate" : "Reactivate"}
          </Button>
        </form>

        <Button
          onClick={() => setOpenDel(true)}
          variant="text"
          color="error"
          sx={{ borderRadius: 999 }}
        >
          Delete
        </Button>
      </Stack>

      <Dialog open={openDel} onClose={() => setOpenDel(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete tenant?</DialogTitle>
        <DialogContent>
          {delState?.errors?._form ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {delState.errors._form}
            </Alert>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            This will permanently delete the tenant. For safety, deletion is blocked if the tenant has leases/invoices.
            In most cases, use Deactivate instead.
          </Typography>

          <form id="delete-tenant-form" action={delAction} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDel(false)} sx={{ borderRadius: 999 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="delete-tenant-form"
            variant="contained"
            color="error"
            disabled={delPending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {delPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
