"use client";

import { Button, styled, Typography } from "@mui/material";
import { Box, darken } from "@mui/system";
import BasePage from "../base-page";
import { NavBar } from "../NavBar";
import { LandingGrahic } from "../LandingGraphic";

import brazucaGraphic from "./brazuca.jpg";
import { toNewRoom } from "@/helpers/link";

const LandingGraphicSection = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  paddingTop: 128,
  paddingLeft: 40,
  paddingRight: 40,
  justifyContent: "center",
  alignItems: "center",
}));

const CallToActionsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "32%",
  bottom: theme.spacing(5),
  right: theme.spacing(-18),
  display: "flex",
  flexDirection: "column",

  [theme.breakpoints.down("lg")]: {
    position: "relative",
    left: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center",
    gap: theme.spacing(2),
  },

  [theme.breakpoints.up("md")]: {
    gap: theme.spacing(2),
  },
}));

const CallToActionText = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  textAlign: "right",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "24px",
  width: 300,

  [theme.breakpoints.up("sm")]: {
    width: "100%",
  },
}));

const CallToActionLink = styled("a")(({ theme }) => ({
  color: "#43BA7F !important",
  textDecoration: "none",
  whiteSpace: "nowrap",

  "&:hover": {
    textDecoration: "underline",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.35)",
  color: theme.palette.common.white,
  minWidth: 200,

  "&:hover, &:focus": {
    color: theme.palette.common.black,
  },
}));

const ManifestSection = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  paddingTop: 0,
  backgroundColor: "#F8C3A9",
  maxHeight: 1200,

  [theme.breakpoints.up("lg")]: {
    paddingTop: 128,
    paddingLeft: 80,
    paddingRight: 80,
    justifyContent: "center",
    minHeight: 1200,
  },
}));

const ManifestCard = styled(Box)(({ theme }) => ({
  borderRadius: 40,
  background:
    "linear-gradient(315deg, #F6F7FC 0%, rgba(246, 247, 252, 0.50) 100%)",
  display: "grid",
  gridTemplateColumns: "auto auto",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",

  padding: theme.spacing(5),

  [theme.breakpoints.up("lg")]: {
    gap: 112,
    maxHeight: 840,
  },

  [theme.breakpoints.down("lg")]: {
	width: "100%",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr",
    padding: 0,
    borderRadius: 0,
    alignItems: "unset",
  },
}));

const ManifestContent = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
  color: "#1D1F26",
  flex: 1,
  gap: theme.spacing(4),

  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2),
	margin: "0 auto",
  },

  maxWidth: 500,
}));

const Title = styled(Typography)(({ theme }) => ({
  color: "#1D1F26",
  fontSize: "88px",
  fontWeight: 600,
  paddingTop: theme.spacing(2),
  lineHeight: "88px /* 100% */",
  textAlign: "center",
  //   [theme.breakpoints?.up("sm")]: {
  //     paddingTop: 112,
  //   },

  [theme.breakpoints.down("lg")]: {
    fontSize: "78px !important",
    textAlign: "center",
  },
}));

const ManifestText = styled(Typography)(({ theme }) => ({
  color: "#646876",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "25px /* 160% */",

  [theme.breakpoints.down("lg")]: {
    fontSize: "14px !important",
    fontWeight: 500,
    lineHeight: "22px /* 160% */",
    textAlign: "left",
  },
}));

const ManifestButton = styled(Button)(({ theme }) => ({
  background: "#F1A05E",
  color: theme.palette.common.white,

  [theme.breakpoints.down("lg")]: {
    width: "100%",
  },

  "&:hover, &:focus": {
    background: darken("#F1A05E", 0.1),
  },
}));

const ManifestGraphicContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "flex-end",
  [theme.breakpoints.down("lg")]: {
    height: 400,
    justifyContent: "center",
    gridRow: "1 / 2",
  },

  [theme.breakpoints.up("sm")]: {
    flex: 1,
  },
}));

const ManifestGraphicFigure = styled("figure")(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(3),
  margin: 0,
  maxHeight: 760,
  aspectRatio: "3 / 4",

  [theme.breakpoints.down("lg")]: {
    aspectRatio: "unset",
    borderRadius: 0,
    width: "100%",
  },
}));

const ManifestGraphic = styled("img")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  height: "100%",
  objectFit: "cover",

  [theme.breakpoints.down("lg")]: {
    width: "100%",
  },
}));

const ManifestGraphicCredits = styled(Typography)(({ theme }) => ({
  display: "flex",
  width: 267,
  height: 46,
  padding: 10,
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  flexShrink: 0,
  borderRadius: "20px 0px 0px 0px",
  background: "rgba(255, 255, 255, 0.60)",
  backdropFilter: "blur(8px)",
  color: theme.palette.common.black,
  position: "absolute",
  right: 0,
  translate: "0 -46px",
}));

const Home = () => {
  return (
    <BasePage>
      <NavBar />
      <LandingGraphicSection>
        <LandingGrahic>
          <CallToActionsContainer>
            <CallToActionText>
              Voting Poker is an{" "}
              <CallToActionLink
                target="_blank"
                href="https://github.com/jeffersonmourak/voting.poker"
              >
                {"{open source}"}
              </CallToActionLink>{" "}
              project that aims to help teams to plan your sprints fast and free
            </CallToActionText>
            <Box
              width={"100%"}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"row-reverse"}
            >
              <ActionButton
                onClick={toNewRoom}
                variant="contained"
                color="secondary"
              >
                Get a room
              </ActionButton>
            </Box>
          </CallToActionsContainer>
        </LandingGrahic>
      </LandingGraphicSection>
      <ManifestSection id="pricing">
        <ManifestCard>
          <ManifestContent>
            <Box
              gap={3}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Title variant="h2">{`It's Free!`}</Title>
              <Box display={"flex"} justifyContent={"center"} width={"95%"}>
                <ManifestText>
                  Open-source software catalyzes developers&apos; innovation,
                  promoting collaboration, transparency, and collective
                  advancement. It empowers the global developer community to
                  collaboratively enhance, personalize, and accelerate
                  solutions, propelling rapid progress across diverse domains.
                  Prioritizing open source fuels technical evolution and
                  cultivates a culture of shared knowledge and skill refinement,
                  laying the foundation for a future where technology is
                  democratized, and creativity knows no bounds.
                </ManifestText>
              </Box>
            </Box>
            <Box width={"100%"} display={"flex"} justifyContent={"center"}>
              <ManifestButton
                onClick={toNewRoom}
                variant="contained"
                color="secondary"
              >
                Create a room
              </ManifestButton>
            </Box>
          </ManifestContent>
          <ManifestGraphicContainer>
            <ManifestGraphicFigure>
              <ManifestGraphic
                src={brazucaGraphic}
                alt="Graphic of people chatting in an airport. Brazuca, By Cezar Berje"
              />
              <ManifestGraphicCredits as="figcaption">
                Brazuca, By Cezar Berje
              </ManifestGraphicCredits>
            </ManifestGraphicFigure>
          </ManifestGraphicContainer>
        </ManifestCard>
      </ManifestSection>
    </BasePage>
  );
};

export default Home;
