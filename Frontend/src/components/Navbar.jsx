import { useState, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, Tooltip, MenuItem, Badge, Popover, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';
import { Menu as MenuIcon, Adb as AdbIcon, AccountCircle, Notifications as NotificationsIcon, CheckCircle } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from "dayjs";
import { API_BASE_URL } from "../config";
import { colors } from "../design-tokens/colors";

const settings = ['Profile', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [role, setRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/users/profile/me`)
      .then((response) => setRole(response.data.role))
      .catch(() => setRole(null));
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setNotificationError("");
    try {
      const token = null;
      const response = await axios.get(`${API_BASE_URL}/notifications?unread_only=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      setNotificationError(error.response?.data?.detail || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = null;
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      setNotificationError(error.response?.data?.detail || "Unable to mark notification as read.");
    }
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{ backgroundColor: colors.surface.dark, borderBottom: `2px solid ${colors.brand.secondary}` }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 76 }, gap: { xs: 0.5, md: 1 } }}>
          <AdbIcon sx={{ color: colors.brand.secondary, fontSize: { xs: 26, md: 30 }, mr: { xs: 0.5, md: 1 } }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/home"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.18rem',
              color: colors.text.inverse,
              textDecoration: 'none',
            }}
          >
            VIDHI
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" onClick={(event) => setAnchorElNav(event.currentTarget)}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={() => setAnchorElNav(null)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {role !== "lawyer" && <MenuItem component={Link} to="/lawyers" onClick={() => setAnchorElNav(null)}>Lawyers</MenuItem>}
              <MenuItem component={Link} to="/cases" onClick={() => setAnchorElNav(null)}>Cases</MenuItem>
              <MenuItem component={Link} to="/news" onClick={() => setAnchorElNav(null)}>News</MenuItem>
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/home"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.18rem',
              color: colors.text.inverse,
              textDecoration: 'none',
            }}
          >
            VIDHI
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {role !== "lawyer" && <Button component={Link} to="/lawyers" sx={{ my: 2, color: 'white' }}>Lawyers</Button>}
            <Button component={Link} to="/cases" sx={{ my: 2, color: 'white' }}>Cases</Button>
            <Button component={Link} to="/news" sx={{ my: 2, color: 'white' }}>News</Button>
          </Box>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={(event) => setAnchorElNotifications(event.currentTarget)}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(anchorElNotifications)}
            anchorEl={anchorElNotifications}
            onClose={() => setAnchorElNotifications(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <List sx={{ width: 300, maxHeight: 300, overflow: 'auto' }}>
              {loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />
              ) : notificationError ? (
                <ListItem><ListItemText primary={notificationError} /></ListItem>
              ) : notifications.length === 0 ? (
                <ListItem><ListItemText primary="No new notifications" /></ListItem>
              ) : (
                notifications.map((notif) => (
                  <ListItem key={notif.id} secondaryAction={
                    <IconButton edge="end" color="primary" onClick={() => markAsRead(notif.id)}>
                      <CheckCircle />
                    </IconButton>
                  }>
                    <ListItemText primary={notif.message} secondary={dayjs(notif.timestamp).format("MMM D, YYYY h:mm A")} />
                  </ListItem>
                ))
              )}
            </List>
          </Popover>
          
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={(event) => setAnchorElUser(event.currentTarget)} sx={{ p: 0.5, color: colors.brand.secondary }}>
                <AccountCircle sx={{ fontSize: 34 }} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => {
                  if (setting === 'Logout') {
                    axios.post(`${API_BASE_URL}/auth/logout`).finally(() => navigate("/"));
                  } else {
                    navigate("/profile");
                  }
                  setAnchorElUser(null);
                }}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
