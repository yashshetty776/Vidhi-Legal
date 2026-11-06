import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";

import { API_BASE_URL } from "../config";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/news/scrape`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 45000,
      });
      setNews(Array.isArray(response.data.news) ? response.data.news : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load legal news. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div>
      <Navbar />
      <Container sx={{ mt: 10, pb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: "center", fontWeight: 700 }}>
          Latest Legal Updates
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
          Recent stories from Bar & Bench
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" action={<Button onClick={fetchNews}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {!loading && !error && news.length === 0 && (
          <Alert severity="info">No legal news articles are available right now.</Alert>
        )}

        {!loading && !error && news.length > 0 && (
          <Grid container spacing={3}>
            {news.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.article_link}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {item.image_link && (
                      <Box
                        component="img"
                        src={item.image_link}
                        alt=""
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 1,
                          mb: 2,
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <Typography variant="h6" component="h2" sx={{ lineHeight: 1.4 }}>
                      {item.headline}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      component="a"
                      href={item.article_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      fullWidth
                    >
                      Read article
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </div>
  );
};

export default NewsFeed;
