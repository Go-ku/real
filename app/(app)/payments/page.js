import Link from "next/link";
import { listPayments } from "@/app/(actions)/payments";
import PaymentCard from "@/components/payments/PaymentCard"
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default async function PaymentsPage() {
  const paymentsRaw = await listPayments({});
    const payments = JSON.parse(JSON.stringify(paymentsRaw));

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Payments
        </Typography>

        <Link href="/payments/new">
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{ borderRadius: 999 }}
          >
            Record payment
          </Button>
        </Link>
      </Stack>

      {payments.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            No payments recorded
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Recorded payments will appear here.
          </Typography>
          <Link href="/payments/new">
            <Button
              variant="outlined"
              sx={{ mt: 2, borderRadius: 999 }}
            >
              Record first payment
            </Button>
          </Link>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {payments.map((p) => (
            <PaymentCard key={p._id} payment={p} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
