import { getProperty } from "@/app/(actions)/properties";
import { listTenants } from "@/app/(actions)/tenants";
import LeaseCreateForm from "@/components/leases/LeaseCreateForm";
import { Box, Typography } from "@mui/material";

export default async function NewLeaseForPropertyPage({ params }) {
  const { propertyId } = await params;

  const property = await getProperty(propertyId);
  if (!property) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Property not found
        </Typography>
      </Box>
    );
  }

  const tenants = await listTenants();
  const propId = String(property._id);
  const sanitizedTenants = JSON.parse(JSON.stringify(tenants));
  return <LeaseCreateForm propertyId={propId} tenants={sanitizedTenants} />;
}
