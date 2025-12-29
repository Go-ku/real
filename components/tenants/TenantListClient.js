"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TenantCard from "./TenantCard";

export default function TenantListClient({ tenants }) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tenants;
    return tenants.filter((t) => {
      return (
        (t.fullName || "").toLowerCase().includes(query) ||
        (t.phone || "").toLowerCase().includes(query) ||
        (t.email || "").toLowerCase().includes(query)
      );
    });
  }, [q, tenants]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Tenants
        </Typography>
        <Link href="/tenants/new">
          <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 999 }}>
            Add
          </Button>
        </Link>
      </Stack>

      <TextField
        label="Search"
        placeholder="Name, phone, email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {filtered.length === 0 ? (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>No tenants found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try a different search.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {filtered.map((t) => (
            <TenantCard key={t._id} tenant={t} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
