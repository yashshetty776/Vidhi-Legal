import { Button, Container, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => (
  <Container maxWidth="sm" sx={{ py: 12 }}>
    <Paper sx={{ p: 5, textAlign: "center" }} elevation={0}>
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The address may be incorrect or the page may have moved.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Return to sign in
      </Button>
    </Paper>
  </Container>
);

export default NotFound;
