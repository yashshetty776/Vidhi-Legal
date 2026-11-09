import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LocationOnOutlined, PersonOutline, SaveOutlined, WorkOutline } from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/Navbar";

import { API_BASE_URL } from "../config";
import { colors, gradients } from "../design-tokens/colors";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: "", location: "", experience: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = null;

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
  }, []);

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
      <Box sx={{ minHeight: "100vh", pt: { xs: 11, md: 13 }, pb: 7, px: { xs: 2, md: 4 }, background: gradients.home }}>
        <Box sx={{ maxWidth: 1050, mx: "auto" }}>
          {loading ? (
            <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : error && !profile ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    color: colors.text.inverse,
                    background: `linear-gradient(155deg, ${colors.surface.dark} 0%, ${colors.brand.dark} 100%)`,
                  }}
                >
                  <Box sx={{ height: 8, backgroundColor: colors.brand.secondary }} />
                  <CardContent sx={{ p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", height: "calc(100% - 8px)" }}>
                    <Typography variant="overline" sx={{ letterSpacing: ".14em", color: "#c8d4ca" }}>
                      Account overview
                    </Typography>
                    <Avatar
                      sx={{
                        width: 92,
                        height: 92,
                        mt: 3,
                        mb: 2.5,
                        fontSize: 34,
                        fontWeight: 700,
                        color: colors.surface.dark,
                        backgroundColor: "#d7dfd4",
                      }}
                    >
                      {profile.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h4" sx={{ color: colors.text.inverse, mb: 1, overflowWrap: "anywhere" }}>
                      {profile.username}
                    </Typography>
                    <Chip
                      label={profile.role}
                      size="small"
                      sx={{ alignSelf: "flex-start", color: colors.text.inverse, backgroundColor: "rgba(255,255,255,0.14)", textTransform: "capitalize" }}
                    />
                    <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.16)" }} />
                    <Stack spacing={2} sx={{ color: "#d7e0d8" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <PersonOutline fontSize="small" />
                        <Box>
                          <Typography variant="caption" sx={{ display: "block", color: "#aebdb1" }}>Full name</Typography>
                          <Typography>{profile.full_name || "Not added yet"}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LocationOnOutlined fontSize="small" />
                        <Box>
                          <Typography variant="caption" sx={{ display: "block", color: "#aebdb1" }}>Location</Typography>
                          <Typography>{profile.location || "Not added yet"}</Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: "auto", pt: 4, color: "#aebdb1", lineHeight: 1.6 }}>
                      Keep your details current so your case information and support stay easy to manage.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ height: "100%", p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
                  <Typography variant="overline" sx={{ color: colors.brand.secondary, letterSpacing: ".14em", fontWeight: 700 }}>
                    Personal details
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.brand.dark, mt: 0.5, mb: 1 }}>
                    Make your profile feel like you
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 600, lineHeight: 1.7 }}>
                    Update the information used to identify you across your legal support journey.
                  </Typography>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                  <Box component="form" onSubmit={saveProfile}>
                    <Stack spacing={2.25}>
                      <TextField
                        fullWidth required label="Full Name"
                        value={form.full_name}
                        onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                      />
                      <TextField
                        fullWidth required label="Location"
                        value={form.location}
                        onChange={(event) => setForm({ ...form, location: event.target.value })}
                      />
                      {profile.role === "lawyer" && (
                        <TextField
                          fullWidth label="Experience (Years)" type="number"
                          inputProps={{ min: 0, max: 80 }}
                          InputProps={{ startAdornment: <WorkOutline sx={{ mr: 1, color: colors.text.secondary }} fontSize="small" /> }}
                          value={form.experience}
                          onChange={(event) => setForm({ ...form, experience: event.target.value })}
                        />
                      )}
                    </Stack>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ mt: 3 }} disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Profile;
