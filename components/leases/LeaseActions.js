"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { endLease, deleteLease } from "@/app/(actions)/leases";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const initialState = { success: false, errors: {} };

export default function LeaseActions({ leaseId, propertyId }) {
  const router = useRouter();
  
  // Menu State
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  
  // Dialog States
  const [openEnd, setOpenEnd] = React.useState(false);
  const [openDel, setOpenDel] = React.useState(false);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const [endState, endAction, endPending] = useActionState(
    async (prev, formData) => endLease(leaseId, prev, formData),
    initialState
  );

  const [delState, delAction, delPending] = useActionState(
    async (prev, formData) => {
      const res = await deleteLease(leaseId);
      return res?.success ? { success: true } : res;
    },
    initialState
  );

  React.useEffect(() => {
    if (endState?.success) {
      setOpenEnd(false);
      router.refresh();
    }
  }, [endState?.success, router]);

  React.useEffect(() => {
    if (delState?.success) {
      setOpenDel(false);
      router.push(`/properties/${propertyId}`);
      router.refresh();
    }
  }, [delState?.success, router, propertyId]);

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={openMenu ? "lease-menu" : undefined}
        aria-expanded={openMenu ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleMenuClick}
        size="small"
        sx={{ position: "absolute", top: 12, right: 8 }}
      >
        <MoreVertRoundedIcon />
      </IconButton>

      <Menu
        id="lease-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem 
          component={Link} 
          href={`/leases/${leaseId}/edit`} 
          onClick={handleMenuClose}
        >
          <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit lease</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={() => { handleMenuClose(); setOpenEnd(true); }}
          sx={{ color: 'warning.main' }}
        >
          <ListItemIcon><EventBusyRoundedIcon fontSize="small" color="warning" /></ListItemIcon>
          <ListItemText>End lease</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={() => { handleMenuClose(); setOpenDel(true); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete lease</ListItemText>
        </MenuItem>
      </Menu>

      {/* --- Dialogs (Remain the same as before) --- */}
      <Dialog open={openEnd} onClose={() => setOpenEnd(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>End Lease?</DialogTitle>
        <DialogContent>
          {endState?.errors?._form && <Alert severity="error" sx={{ mb: 2 }}>{endState.errors._form}</Alert>}
          <Typography variant="body2" color="text.secondary">
            This marks the lease as finished and the property as vacant.
          </Typography>
          <form id="end-lease-form" action={endAction}>
            <input type="hidden" name="endDate" value={new Date().toISOString().slice(0, 10)} />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEnd(false)} color="inherit">Cancel</Button>
          <Button type="submit" form="end-lease-form" variant="contained" color="warning" disabled={endPending}>
            End Lease
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDel} onClose={() => setOpenDel(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Lease?</DialogTitle>
        <DialogContent>
          {delState?.errors?._form && <Alert severity="error" sx={{ mb: 2 }}>{delState.errors._form}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Permanently delete this lease? (Only allowed if no payments exist).
          </Typography>
          <form id="delete-lease-form" action={delAction} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDel(false)} color="inherit">Cancel</Button>
          <Button type="submit" form="delete-lease-form" variant="contained" color="error" disabled={delPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}