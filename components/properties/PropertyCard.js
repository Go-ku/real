import Link from "next/link";
import { Card, CardActionArea, CardContent, Stack, Typography, Chip } from "@mui/material";
import { formatAddress } from "@/lib/formatters";
function statusChip(status) {
  if (status === "occupied") return <Chip size="small" label="Occupied" />;
  if (status === "maintenance") return <Chip size="small" label="Maintenance" />;
  return <Chip size="small" label="Vacant" variant="outlined" />;
}

export default function PropertyCard({ property }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <Link href={`/properties/${property._id}`}>
        <CardActionArea >
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {property.name}
            </Typography>
            {statusChip(property.status)}
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatAddress(property.address)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {property.type}
          </Typography>
        </CardContent>
      </CardActionArea>
      </Link>
    </Card>
  );
}
