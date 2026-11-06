import { useState } from "react";
import { Container, TextField, Button, Typography, Alert, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const CreateCase = () => {
  const [caseData, setCaseData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // ✅ Predefined case categories
  const categories = [
    "Education",
    "Real Estate",
    "Personal Injury",
    "Criminal",
    "Traffic",
    "Contract Disputes",
    "Property Disputes",
    "Consumer Complaints",
    "Family Law",
    "Employment Issues",
    "Theft and Fraud",
    "Cybercrime",
    "Medical Malpractice",
    "Land Disputes",
    "Business Contracts",

  ];

  // ✅ Handle input change
  const handleChange = (e) => {
    setCaseData({ ...caseData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (caseData.title.trim().length < 5 || caseData.description.trim().length < 20 || !caseData.category) {
      setError("Enter a title of at least 5 characters, a description of at least 20 characters, and a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/cases/create_case`, {
        ...caseData,
        title: caseData.title.trim(),
        description: caseData.description.trim(),
        category: caseData.category.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Case created successfully!");
      setTimeout(() => navigate("/cases"), 1200);
    } catch (error) {
      const detail = error.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail || "Error creating case");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar/>
    <div>
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom sx={{ marginTop:10 }}>
        Create a New Case
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          value={caseData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Description"
          name="description"
          value={caseData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />

        {/* ✅ Category Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={caseData.category}
            onChange={handleChange}
            required
          >
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Case"}
        </Button>
      </form>
    </Container>
    </div>
    </div>
  );
};

export default CreateCase;
