"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/(actions)/auth";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Container,
} from "@mui/material";

const initialState = { success: false, errors: {} };

export default function LoginPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(login, initialState);

  React.useEffect(() => {
    if (state?.success) router.push("/dashboard");
  }, [state, router]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", py: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 3, width: "100%" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
            Nyumba
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Landlord login
          </Typography>

          {state?.errors?._form ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.errors._form}
            </Alert>
          ) : null}

          <Box component="form" action={action}>
            <Stack spacing={1.5}>
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                error={!!state?.errors?.password}
                helperText={state?.errors?.password || " "}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={pending}
                sx={{ borderRadius: 999, py: 1.2, fontWeight: 800 }}
              >
                {pending ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
