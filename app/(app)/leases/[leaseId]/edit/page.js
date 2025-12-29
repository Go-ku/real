import { getLease } from "@/app/(actions)/leases";
import LeaseEditForm from "@/components/leases/LeaseEditForm";
import { Box, Typography } from "@mui/material";

export default async function EditLeasePage({ params }) {
  const { leaseId } = await params

  const leaseRaw = await getLease(leaseId);
  const lease = JSON.parse(JSON.stringify(leaseRaw));
  if (!lease) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Lease not found
        </Typography>
      </Box>
    );
  }

  

  return <LeaseEditForm lease={lease} />;
}
