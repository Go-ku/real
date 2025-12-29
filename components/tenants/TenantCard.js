import Link from "next/link";
import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";

export default function TenantCard({ tenant }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardActionArea component={Link} href={`/tenants/${tenant._id}`}>
        <CardContent>
          <Typography sx={{ fontWeight: 900 }}>{tenant.fullName}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary">
              {tenant.phone}
            </Typography>
            {tenant.email ? (
              <Typography variant="body2" color="text.secondary">
                • {tenant.email}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
