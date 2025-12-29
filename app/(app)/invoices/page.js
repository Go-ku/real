import { listInvoices } from "@/app/(actions)/invoices";
import InvoiceListClient from "@/components/invoices/InvoiceClientList";

export default async function InvoicesPage() {
  const invoices = await listInvoices({});
  const sanitizedInvoices = JSON.parse(JSON.stringify(invoices));   
  return <InvoiceListClient invoices={sanitizedInvoices} />;
}
