"use client";

import * as React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import InvoiceCard from "@/components/invoices/InvoiceCard";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
  { key: "all", label: "All" },
];

export default function InvoiceListClient({ invoices }) {
  const [filter, setFilter] = React.useState("open");

  const filtered = React.useMemo(() => {
    if (filter === "all") return invoices;
    if (filter === "overdue") return invoices.filter((i) => i.status === "overdue");
    if (filter === "paid") return invoices.filter((i) => i.status === "paid");
    // open
    return invoices.filter((i) => ["due", "overdue", "partial"].includes(i.status));
  }, [filter, invoices]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
        Invoices
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            clickable
            onClick={() => setFilter(f.key)}
            variant={filter === f.key ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      <Stack spacing={1.25}>
        {filtered.map((inv) => (
          <InvoiceCard key={inv._id} invoice={inv} />
        ))}
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ mt: 3, p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>No invoices here</Typography>
          <Typography variant="body2" color="text.secondary">
            Try another filter.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
