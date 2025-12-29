import { getPayment } from "@/app/(actions)/payments";
import ReceiptClient from "@/components/payments/ReceiptClient";
import { Box, Typography } from "@mui/material";

export default async function PaymentReceiptPage({ params }) {
  const { paymentId } = await params;

  const payment = await getPayment(paymentId);
  if (!payment) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Receipt not found
        </Typography>
      </Box>
    );
  }

  return <ReceiptClient payment={payment} />;
}
