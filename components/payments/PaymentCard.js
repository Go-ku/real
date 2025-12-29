import Link from "next/link";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import money from "@/lib/money";


export default function PaymentCard({ payment }) {
  const propertyId =
    payment.invoiceId?.propertyId?._id ||
    payment.invoiceId?.propertyId;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 800 }}>
              {money(payment.amount)}
            </Typography>
            <Chip
              size="small"
              label={payment.method?.toUpperCase() || "PAYMENT"}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {new Date(payment.paidAt).toLocaleDateString()}
          </Typography>

          {payment.invoiceId ? (
            <Typography variant="body2">
              Invoice: <b>{payment.invoiceId.period}</b>
            </Typography>
          ) : null}

          {payment.invoiceId?.tenantId ? (
            <Typography variant="body2" color="text.secondary">
              Tenant: {payment.invoiceId.tenantId.fullName}
            </Typography>
          ) : null}

          {propertyId ? (
            <Box>
              <Link href={`/properties/${propertyId}`}>
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ textDecoration: "none", fontWeight: 800 }}
                >
                  View property →
                </Typography>
              </Link>
            </Box>
          ) : null}
        </Stack>
        <Box>
  <Link href={`/payments/${payment._id}/receipt`}>
    <Typography
    
    component="span"
    variant="caption"
    sx={{ textDecoration: "none", fontWeight: 800 }}
  >
    View receipt →
  </Typography>
  </Link>
</Box>

      </CardContent>
    </Card>
  );
}
