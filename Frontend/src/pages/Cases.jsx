import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Navbar from "../components/Navbar";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [myCasesLoading, setMyCasesLoading] = useState(false);
  const [actionCaseId, setActionCaseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.role);
      } catch {
        setError("Your session is invalid. Please sign in again.");
      }
    }
  }, []);

  useEffect(() => {
    if (role) {
      fetchCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchCases = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/cases/list_cases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allCases = response.data;
      if (role === "lawyer") {
        setCases(allCases.filter((c) => c.status === "pending"));
      } else {
        setCases(allCases);
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to load cases.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCases = async () => {
    setMyCasesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/cases/user_cases/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCases(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to load your cases.");
    } finally {
      setMyCasesLoading(false);
    }
  };

  const acceptCase = async (caseId) => {
    setActionCaseId(caseId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/cases/${caseId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCases();
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to accept this case.");
    } finally {
      setActionCaseId(null);
    }
  };

  const updateCaseStatus = async (caseId, newStatus) => {
    setActionCaseId(caseId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/cases/${caseId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchMyCases();
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to update case status.");
    } finally {
      setActionCaseId(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Navbar/>
      <div>
      <Container 
        sx={{ 
          mt: 4, 
          background: 'linear-gradient(to bottom, #f5e1da, #e6c9a8)', // Light Brown to Peach Gradient
          minHeight: '100vh', 
          py: 4, 
          borderRadius: 3 
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            marginTop: 10, 
            color: '#5a3e2b', // Deep brown for contrast
            fontWeight: 'bold', 
            textAlign: 'center'
          }}
        >
          {role === "client" ? "My Cases" : "Available Cases"}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {role === "lawyer" && (
          <Button
            variant="contained"
            sx={{ 
              mb: 2, 
              backgroundColor: "#8B5E3B", // Brown tone
              color: "#fff", 
              fontWeight: "bold", 
              "&:hover": { backgroundColor: "#704832" } 
            }}
            onClick={() => {
              fetchMyCases(); 
              setOpen(true);
            }}
          >
            My Cases
          </Button>
        )}

        {role === "client" && (
          <Button
            variant="contained"
            sx={{ 
              mb: 2, 
              backgroundColor: "#D28A59", // Warm peach shade
              fontWeight: "bold", 
              "&:hover": { backgroundColor: "#B86E42" } 
            }}
            onClick={() => navigate("/create-case")}
          >
            + Add Case
          </Button>
        )}

        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        ) : cases.length > 0 ? (
          cases.map((caseItem) => (
            <Card 
              key={caseItem.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                boxShadow: 4, 
                borderRadius: 3, 
                transition: "all 0.3s ease", 
                backgroundColor: "white", // Keeping Cards White
                "&:hover": { transform: "scale(1.02)", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: "#8B5E3B", fontWeight: "bold" }}>
                  {caseItem.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: "#5a3e2b" }}>
                  {caseItem.description}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#704832", fontStyle: "italic" }}>
                  Status: {caseItem.status}
                </Typography>

                {role === "lawyer" && caseItem.status === "pending" && (
                  <Button
                    variant="contained"
                    sx={{ 
                      mt: 1, 
                      backgroundColor: "#A6643E", // Richer brown tone
                      "&:hover": { backgroundColor: "#8C5432" } 
                    }}
                    onClick={() => acceptCase(caseItem.id)}
                    disabled={actionCaseId === caseItem.id}
                  >
                    {actionCaseId === caseItem.id ? "Accepting..." : "Take Case"}
                  </Button>
                )}

                {role === "client" && caseItem.status === "accepted" && (
                  <Button
                    variant="contained"
                    sx={{ 
                      mt: 1, 
                      backgroundColor: "#A6643E", // Richer brown tone
                      "&:hover": { backgroundColor: "#8C5432" } 
                    }}
                    onClick={() => navigate(`/chat/${caseItem.id}`)}
                  >
                    Chat Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography 
            variant="h6" 
            color="textSecondary" 
            sx={{ mt: 2, textAlign: "center", fontStyle: "italic" }}
          >
            No cases to be displayed.
          </Typography>
        )}

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>My Cases</DialogTitle>
          <DialogContent>
            {myCasesLoading ? <CircularProgress sx={{ display: "block", margin: "20px auto" }} /> : myCases.length > 0 ? (
              myCases.map((caseItem) => (
                <Card 
                  key={caseItem.id} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    boxShadow: 4, 
                    borderRadius: 3, 
                    transition: "all 0.3s ease", 
                    backgroundColor: "white", // Keeping Cards White
                    "&:hover": { transform: "scale(1.02)", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#8B5E3B", fontWeight: "bold" }}>
                      {caseItem.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: "#5a3e2b" }}>
                      {caseItem.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#704832", fontStyle: "italic" }}>
                      Status: {caseItem.status}
                    </Typography>
                    {role === "lawyer" && caseItem.status !== "closed" && (
                      <Select
                        fullWidth
                        value={caseItem.status}
                        onChange={(event) => updateCaseStatus(caseItem.id, event.target.value)}
                        disabled={actionCaseId === caseItem.id}
                        sx={{ mt: 2 }}
                      >
                        <MenuItem value="accepted">Accepted</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    )}
                    <Button
                      variant="contained"
                      sx={{ 
                        mt: 2, 
                        backgroundColor: "#A6643E", // Richer brown tone
                        "&:hover": { backgroundColor: "#8C5432" } 
                      }}
                      onClick={() => navigate(`/chat/${caseItem.id}`)}
                    >
                      Chat Now
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography 
                variant="h6" 
                color="textSecondary" 
                sx={{ mt: 2, textAlign: "center", fontStyle: "italic" }}
              >
                No cases to be displayed.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </div>
    </div>
  );
};

export default Cases;