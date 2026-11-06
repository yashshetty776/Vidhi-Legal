import { useState, useEffect } from "react";
import { Alert, Container, Typography, Card, CardContent, Grid, Avatar, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/users/profile/me`)
      .then((response) => {
        setRole(response.data.role);
        if (response.data.role === "client") fetchLawyers();
      })
      .catch(() => setError("Your session is invalid. Please sign in again."));
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = null;
      const response = await axios.get(`${API_BASE_URL}/users/lawyers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLawyers(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to load the lawyer directory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
        <Navbar />
      <div>
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center",marginTop: 5 }}>
        Available Lawyers
      </Typography>
      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {role === "client" ? (
        lawyers.length > 0 ? (
          <Grid container spacing={3}>
            {lawyers.map((lawyer) => (
              <Grid item xs={12} sm={6} md={4} key={lawyer.id}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
                  }}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                        bgcolor: "#1976d2",
                      }}
                    >
                      {lawyer.full_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
                      {lawyer.full_name || "Unknown Name"}
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary">
                      {lawyer.email || "No email available"}
                    </Typography> */}
                    <Box sx={{ mt: 1, textAlign: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Experience:{" "}
                        <span style={{ fontWeight: "normal" }}>
                          {lawyer.experience ? `${lawyer.experience} years` : "Not specified"}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Location:{" "}
                        <span style={{ fontWeight: "normal" }}>{lawyer.location || "Not provided"}</span>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography textAlign="center" sx={{ mt: 3, fontSize: "1.2rem", fontWeight: "bold", color: "gray" }}>
            No lawyers available at the moment.
          </Typography>
        )
      ) : (
        <Typography textAlign="center" sx={{ mt: 3, fontSize: "1.2rem", fontWeight: "bold", color: "gray" }}>
          Only clients can view the list of lawyers.
        </Typography>
      )}
    </Container>
    </div>
    </div>
    
  );
};

export default Lawyers;
