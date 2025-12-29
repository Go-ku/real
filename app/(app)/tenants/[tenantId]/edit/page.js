import { getTenant } from "@/app/(actions)/tenants";
import TenantEditForm from "@/components/tenants/TenantEditForm";
import { Box, Typography } from "@mui/material";

export default async function TenantEditPage({ params }) {
  const { tenantId } = await params;

  const tenantRaw = await getTenant(tenantId);
const tenant = JSON.parse(JSON.stringify(tenantRaw));
  if (!tenant) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Tenant not found
        </Typography>
      </Box>
    );
  }

  return <TenantEditForm tenant={tenant} />;
}
