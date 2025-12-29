import Link from "next/link";
import { listProperties } from "@/app/(actions)/properties";
import PropertyCard from "@/components/properties/PropertyCard";
import { Box, Stack, Typography, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default async function PropertiesPage() {
  const properties = await listProperties();

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Properties
        </Typography>
        <Link href="/properties/new">
         <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{ borderRadius: 999 }}
        >
          Add
        </Button>
        </Link>
      </Stack>

      {properties.length === 0 ? (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700 }}>No properties yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add your first property to start tracking leases, invoices and payments.
          </Typography>
          <Button
            component={Link}
            href="/properties/new"
            variant="outlined"
            sx={{ mt: 2, borderRadius: 999 }}
          >
            Add property
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
