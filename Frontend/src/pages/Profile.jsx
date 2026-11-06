import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";

import { API_BASE_URL } from "../config";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: "", location: "", experience: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setForm({
          full_name: response.data.full_name || "",
          location: response.data.location || "",
          experience: response.data.experience ?? "",
        });
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.full_name.trim().split(/\s+/).length < 2 || form.location.trim().length < 2) {
      setError("Enter your first and last name and a valid location.");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/profile/me`,
        {
          full_name: form.full_name.trim(),
          location: form.location.trim(),
          ...(profile.role === "lawyer" && form.experience !== ""
            ? { experience: Number(form.experience) }
            : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ minHeight: "100vh", pt: 12, px: 2, display: "flex", justifyContent: "center" }}>
        <Card sx={{ width: 700, maxWidth: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            {loading ? (
              <CircularProgress />
            ) : error && !profile ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <Avatar sx={{ width: 96, height: 96, mb: 2, fontSize: 36 }}>
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h4" gutterBottom>{profile.username}</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {profile.role}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box component="form" onSubmit={saveProfile}>
                  <TextField
                    fullWidth required label="Full Name" margin="normal"
                    value={form.full_name}
                    onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  />
                  <TextField
                    fullWidth required label="Location" margin="normal"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                  />
                  {profile.role === "lawyer" && (
                    <TextField
                      fullWidth label="Experience (Years)" type="number" margin="normal"
                      inputProps={{ min: 0, max: 80 }}
                      value={form.experience}
                      onChange={(event) => setForm({ ...form, experience: event.target.value })}
                    />
                  )}
                  <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Profile;
