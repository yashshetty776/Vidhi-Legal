import { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Link,
  Stack,
  MenuItem,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let tempErrors = {};
    tempErrors.fullName = fullName.trim().split(/\s+/).length >= 2 ? '' : 'Enter your first and last name';
    tempErrors.username = /^[A-Za-z0-9_]{3,50}$/.test(username.trim()) ? '' : 'Use 3-50 letters, numbers, or underscores';
    const hasPasswordRequirements =
      password.length >= 8 &&
      password.length <= 72 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
    tempErrors.password = hasPasswordRequirements
      ? ''
      : 'Use 8-72 characters with lowercase, uppercase, and a special character';
    tempErrors.role = role === 'client' || role === 'lawyer' ? '' : 'Choose a valid role';
    tempErrors.experience = role === 'lawyer' && (!Number.isInteger(Number(experience)) || Number(experience) < 0)
      ? 'Enter valid experience in years'
      : '';
    tempErrors.location = location.trim().length >= 2 ? '' : 'Location is required';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        const payload = {
          full_name: fullName.trim(),
          username: username.trim(),
          password,
          role,
          experience: role === 'lawyer' ? Number(experience) : null,
          location: location.trim()
        };
  
        const response = await axios.post('http://localhost:8000/register', payload);
        
        // Extract token
        const token = response.data.token;
  
        // Store token
        localStorage.setItem("token", token);
  
        navigate('/home', { replace: true });
    } catch (error) {
      const detail = error.response?.data?.detail;
      setServerError(
        Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail || "Registration failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e3f2fd',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
              />
              <TextField
                select
                margin="normal"
                required
                fullWidth
                id="role"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="client">client</MenuItem>
                <MenuItem value="lawyer">lawyer</MenuItem>
              </TextField>
              {role === 'lawyer' && (
                <TextField
                  margin="normal"
                  fullWidth
                  id="experience"
                  label="Experience (Years)"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  error={Boolean(errors.experience)}
                  helperText={errors.experience}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="location"
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={Boolean(errors.location)}
                helperText={errors.location}
              />
              {serverError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {serverError}
                </Typography>
              )}
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <Stack direction="row" justifyContent="flex-end">
                <Link component={RouterLink} to="/signin" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;
