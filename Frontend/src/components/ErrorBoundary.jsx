import { Component } from "react";
import { Alert, Box, Button, Container, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled frontend error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      // eslint-disable-next-line react/prop-types
      return this.props.children;
    }

    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
          <Paper sx={{ width: "100%", p: 4, textAlign: "center" }} elevation={3}>
            <Typography variant="h3" gutterBottom>
              Something went wrong
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              The page could not be displayed. Try again or return to the home page.
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {this.state.error?.message || "Unexpected application error"}
            </Alert>
            <Button onClick={() => window.location.reload()} variant="contained" sx={{ mr: 1 }}>
              Try again
            </Button>
            <Button component={RouterLink} to="/" variant="outlined">
              Go to sign in
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }
}

export default ErrorBoundary;
