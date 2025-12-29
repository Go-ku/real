import { listTenants } from "@/app/(actions)/tenants";
import TenantListClient from "@/components/tenants/TenantListClient";

export default async function TenantsPage() {
  const tenants = await listTenants();
  const sanitizedTenants = JSON.parse(JSON.stringify(tenants));
  return <TenantListClient tenants={sanitizedTenants} />;
}
