import { Box, CardMedia, Container, Grid, Paper, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { colors, gradients } from "../design-tokens/colors";

const highlights = [
  {
    title: "A simpler path to legal support",
    description: "Find reliable information and practical support for the legal matters that affect you.",
    imageUrl:
      "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1500&q=80",
  },
  {
    title: "Know your rights",
    description: "Clear, practical guidance to help you understand your legal options.",
    imageUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Navigate the process",
    description: "Make complex legal procedures easier to understand and follow.",
    imageUrl:
      "https://www.legid.app/wp-content/uploads/online-education-3412473_1920.jpg",
  },
  {
    title: "Access trusted support",
    description: "Connect with legal professionals and manage your case in one place.",
    imageUrl:
      "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1470&q=80",
  },
];

const Home = () => (
  <>
    <Navbar />
    <Container maxWidth="xl" sx={{ pt: 10, pb: 5, background: gradients.home, minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 760, mx: "auto", mb: 4, textAlign: "center", color: colors.text.primary }}>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3.6rem" }, mb: 1 }}>
          Legal help, made clearer.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
          Understand your rights, manage your case, and find the support you need.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Carousel
          navButtonsAlwaysVisible
          autoPlay={false}
          indicators
          NextIcon={<ArrowForwardIos />}
          PrevIcon={<ArrowBackIos />}
          sx={{ height: { xs: 430, md: 500 } }}
          navButtonsProps={{
            style: {
              backgroundColor: colors.brand.dark,
              color: colors.text.inverse,
            },
          }}
        >
          {highlights.map((item) => (
            <Paper key={item.title} sx={{ overflow: "hidden", borderRadius: 3, height: { xs: 390, md: 460 } }}>
              <CardMedia
                component="img"
                image={item.imageUrl}
                alt={item.title}
                sx={{ height: { xs: 245, md: 310 }, objectFit: "cover" }}
              />
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, backgroundColor: colors.surface.card }}>
                <Typography variant="h4" sx={{ color: colors.brand.dark, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.description}</Typography>
              </Box>
            </Paper>
          ))}
        </Carousel>
      </Box>

      <Grid container spacing={3} sx={{ maxWidth: 980, mx: "auto", mt: 5 }}>
        <Grid item xs={12} md={7}>
          <Box sx={{ color: colors.text.primary, p: { xs: 1, md: 3 } }}>
            <Typography variant="h4" sx={{ mb: 2 }}>A calmer way to handle legal matters.</Typography>
            <Typography sx={{ lineHeight: 1.8 }}>
              Vidhi brings legal information, case management, private communication, and trusted
              support together in one straightforward platform.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3.5, color: colors.text.inverse, backgroundColor: colors.brand.dark, border: `1px solid ${colors.brand.primary}` }}>
            <Typography variant="h6" sx={{ color: "#d7e0d8", mb: 1 }}>Built for clarity</Typography>
            <Typography sx={{ color: "#c0cec3", lineHeight: 1.7 }}>
              Simple tools, understandable updates, and secure access to your case information.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box component="footer" sx={{ maxWidth: 980, mx: "auto", mt: 7, pt: 3, borderTop: "1px solid rgba(61,56,51,0.2)", color: colors.text.primary }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} Vidhi · Legal information and support for everyone.
        </Typography>
      </Box>
    </Container>
  </>
);

export default Home;
