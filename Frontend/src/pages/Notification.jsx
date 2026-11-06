import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import axios from "axios";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = null;
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = null;
      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to mark notification as read."
      );
    }
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ maxWidth: 800, mx: "auto", pt: 12, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        {error && (
          <Alert severity="error" action={<Button onClick={fetchNotifications}>Retry</Button>}>
            {error}
          </Alert>
        )}
        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        ) : notifications.length === 0 ? (
          <Alert severity="info">No notifications yet.</Alert>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                secondaryAction={
                  !notification.read && (
                    <IconButton
                      edge="end"
                      color="primary"
                      aria-label="Mark as read"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={notification.message}
                  secondary={`${notification.notification_type} • ${dayjs(
                    notification.timestamp
                  ).format("MMM D, YYYY h:mm A")}`}
                  sx={{ opacity: notification.read ? 0.65 : 1 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </div>
  );
};

export default Notifications;
