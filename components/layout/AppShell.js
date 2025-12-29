"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { logout } from "@/app/(actions)/auth";

function routeToTab(pathname) {
  if (pathname.startsWith("/properties")) return "/properties";
  if (pathname.startsWith("/tenants")) return "/tenants";
  if (pathname.startsWith("/invoices")) return "/invoices";
  return "/dashboard";
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [value, setValue] = React.useState(routeToTab(pathname));

  React.useEffect(() => {
    setValue(routeToTab(pathname));
  }, [pathname]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar elevation={0} position="sticky" color="transparent">
        <Toolbar sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Nyumba
          </Typography>
          <Box sx={{ flex: 1 }} />
          <form action={logout}>
            <Button type="submit" variant="text" sx={{ borderRadius: 999 }}>
              Logout
            </Button>
          </form>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2, pb: 10 }}>
        {children}
      </Container>

      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
            router.push(newValue);
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Home"
            value="/dashboard"
            icon={<HomeRoundedIcon />}
          />
          <BottomNavigationAction
            label="Properties"
            value="/properties"
            icon={<ApartmentRoundedIcon />}
          />
          <BottomNavigationAction
            label="Tenants"
            value="/tenants"
            icon={<PeopleRoundedIcon />}
          />
          <BottomNavigationAction
            label="Invoices"
            value="/invoices"
            icon={<ReceiptLongRoundedIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
