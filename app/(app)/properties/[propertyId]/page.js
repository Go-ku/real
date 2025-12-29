import Link from "next/link";
import { getProperty } from "@/app/(actions)/properties";
import { getActiveLeaseByProperty } from "@/app/(actions)/leases";
import { listInvoices } from "@/app/(actions)/invoices";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import LeaseActions from "@/components/leases/LeaseActions";

function statusChip(status) {
  if (status === "occupied") return <Chip size="small" label="Occupied" />;
  if (status === "maintenance")
    return <Chip size="small" label="Maintenance" />;
  return <Chip size="small" label="Vacant" variant="outlined" />;
}

export default async function PropertyDetailPage({ params }) {
  const { propertyId } = await params;

  const property = await getProperty(propertyId);
  if (!property) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Property not found
        </Typography>
      </Box>
    );
  }

  const activeLease = await getActiveLeaseByProperty(propertyId);
  const invoices = await listInvoices({ propertyId });

  const overdue = invoices.filter((i) => i.status === "overdue");
  const dueSoon = invoices.filter(
    (i) => i.status === "due" || i.status === "partial"
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {property.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {property.address}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {property.type}
          </Typography>
        </Box>
        {statusChip(property.status)}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Link href={`/properties/${propertyId}/payments`}>
          <Button
            variant="outlined"
            startIcon={<PaymentsRoundedIcon />}
            sx={{ borderRadius: 999 }}
          >
            View payments
          </Button>
        </Link>

        {!activeLease ? (
          <Link href={`/properties/${propertyId}/leases/new`}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{ borderRadius: 999 }}
            >
              Create lease
            </Button>
          </Link>
        ) : null}
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3, position: "relative" }}>
  <CardContent sx={{ pt: 3 }}> {/* Add padding top to avoid icon overlap */}
    <Typography sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Lease Details
    </Typography>

    {!activeLease ? (
      <Typography variant="body2" color="text.secondary">
        No active lease for this property.
      </Typography>
    ) : (
      <Stack spacing={1}>
        <Typography variant="body2">
          <b>Tenant:</b> {activeLease.tenantId?.fullName || "—"}
        </Typography>
        <Typography variant="body2">
          <b>Phone:</b> {activeLease.tenantId?.phone || "—"}
        </Typography>
        <Typography variant="body2">
          <b>Rent:</b> ZMW {activeLease.rentAmount}
        </Typography>
        <Typography variant="body2">
          <b>Due Day:</b> Day {activeLease.dueDay}
        </Typography>
      </Stack>
    )}

    {activeLease && (
      <LeaseActions
        leaseId={activeLease._id}
        propertyId={propertyId}
      />
    )}
  </CardContent>
</Card>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ fontWeight: 900, mb: 1 }}>Invoices</Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip label={`Overdue: ${overdue.length}`} />
        <Chip label={`Due/Partial: ${dueSoon.length}`} variant="outlined" />
      </Stack>

      {invoices.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>No invoices yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create a lease to auto-generate monthly invoices.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {invoices.slice(0, 8).map((inv) => (
            <Card key={inv._id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ fontWeight: 800 }}>{inv.period}</Typography>
                  <Chip size="small" label={inv.status} />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Due: {new Date(inv.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Amount: {inv.amount} • Paid: {inv.paidAmount}
                </Typography>
                
              </CardContent>
            </Card>
          ))}
          {invoices.length > 8 ? (
            <Link href={`/properties/${propertyId}/invoices`}>
              <Button
                variant="outlined"
                sx={{ borderRadius: 999, mt: 1 }}
              >
                View all invoices
              </Button>
            </Link>
          ) : null}
        </Stack>
      )}
    </Box>
  );
}
