import PaymentCreateForm from "@/components/payments/PaymentCreateForm";
import { listProperties } from "@/app/(actions)/properties";
import { listInvoices } from "@/app/(actions)/invoices";
import { Box, Typography } from "@mui/material";

export default async function NewPaymentPage({searchParams}) {
  const propertiesRaw  = await listProperties();
    const properties = JSON.parse(JSON.stringify(propertiesRaw));
const initialPropertyId = (await searchParams)?.propertyId || null;
const initialInvoiceId = (await searchParams)?.invoiceId || null;

  // Load invoices (we’ll filter to open statuses here)
  const invoices = await listInvoices({});
  const openInvoices = invoices.filter((i) => ["due", "overdue", "partial"].includes(i.status));
  const openInvoicesSanitized = JSON.parse(JSON.stringify(openInvoices));
  if (properties.length === 0) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Record payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You need to add a property first.
        </Typography>
      </Box>
    );
  }

  return <PaymentCreateForm properties={properties} openInvoices={openInvoicesSanitized} initialPropertyId={initialPropertyId} initialInvoiceId={initialInvoiceId} />;
}
