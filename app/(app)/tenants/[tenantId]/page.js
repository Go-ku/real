import Link from "next/link";
import { getTenant } from "@/app/(actions)/tenants";
import { listLeasesByTenant } from "@/app/(actions)/leases";
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
import money from "@/lib/money";
import TenantActions from "@/components/tenants/TenantActions";

export default async function TenantDetailPage({ params }) {
  const { tenantId } = await params;

  const tenant = await getTenant(tenantId);
  if (!tenant) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Tenant not found
        </Typography>
      </Box>
    );
  }

  const leasesRaw = await listLeasesByTenant(tenantId);
  const leases = JSON.parse(JSON.stringify(leasesRaw));
  const invoicesAll = await listInvoices({ tenantId });
  const openInvoices = invoicesAll.filter((i) =>
    ["due", "overdue", "partial"].includes(i.status)
  );
  const overdueInvoices = invoicesAll.filter((i) => i.status === "overdue");

  return (
    <Box>
      <Stack spacing={0.25} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {tenant.fullName}
        </Typography>
        <Chip
          size="small"
          label={tenant.isActive === false ? "Inactive" : "Active"}
          variant={tenant.isActive === false ? "outlined" : "filled"}
          sx={{ width: "fit-content", mt: 1 }}
        />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {tenant.phone} {tenant.email ? `• ${tenant.email}` : ""}
        </Typography>
      </Stack>
      <TenantActions tenantId={tenantId} isActive={tenant.isActive !== false} />
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label={`Leases: ${leases.length}`} />
        <Chip
          label={`Open invoices: ${openInvoices.length}`}
          variant="outlined"
        />
        <Chip label={`Overdue: ${overdueInvoices.length}`} color="warning" />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ fontWeight: 900, mb: 1 }}>Leases</Typography>
      {leases.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>No leases yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a lease from a property page.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {leases.map((l) => {
            const property = l.propertyId;
            return (
              <Card key={l._id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography sx={{ fontWeight: 900 }}>
                      {property?.name || "Property"}
                    </Typography>
                    <Chip size="small" label={l.status} />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Rent: {money(l.rentAmount)} • Due day: {l.dueDay}
                  </Typography>

                  {property?._id ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Link href={`/properties/${property._id}`}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 999 }}
                        >
                          View property
                        </Button>
                      </Link>
                      <Link href={`/leases/${l._id}/edit`}>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ borderRadius: 999 }}
                        >
                          Edit lease
                        </Button>
                      </Link>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ fontWeight: 900, mb: 1 }}>Open invoices</Typography>
      {openInvoices.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>No open invoices</Typography>
          <Typography variant="body2" color="text.secondary">
            This tenant has nothing due right now.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {openInvoices.slice(0, 8).map((inv) => (
            <Card key={inv._id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ fontWeight: 900 }}>{inv.period}</Typography>
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
                  Amount: <b>{money(inv.amount)}</b> • Paid:{" "}
                  <b>{money(inv.paidAmount)}</b>
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  <Link href={`/payments/new?invoiceId=${inv._id}`}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ borderRadius: 999, fontWeight: 800 }}
                    >
                      Record payment
                    </Button>
                  </Link>
                  <Link
                    href={`/properties/${
                      inv.propertyId?._id || inv.propertyId
                    }`}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 999 }}
                    >
                      Property
                    </Button>
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {openInvoices.length > 8 ? (
            <Link href="/invoices">
              <Button variant="text" sx={{ borderRadius: 999 }}>
                View all invoices
              </Button>
            </Link>
          ) : null}
        </Stack>
      )}
    </Box>
  );
}
