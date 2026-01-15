import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import {
  AddRounded,
  CategoryRounded,
  DeleteForeverRounded,
  FiberManualRecord,
  TaskAltRounded,
} from "@mui/icons-material";
import { Divider, IconButton, MenuItem, SwipeableDrawer, Tooltip } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogoutDialog } from ".";
import { defaultUser } from "../constants/defaultUser";
import { UserContext } from "../contexts/UserContext";

import { UserAvatar, pulseAnimation, reduceMotion, ring } from "../styles";
import { ColorPalette } from "../theme/themeConfig";
import { getProfilePictureFromDB, showToast, systemInfo } from "../utils";

export const ProfileSidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const { name, profilePicture, tasks, settings } = user;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);

  const n = useNavigate();

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadProfilePicture = async () => {
      const picture = await getProfilePictureFromDB(profilePicture);
      setAvatarSrc(picture);
    };
    loadProfilePicture();
  }, [profilePicture]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container>
      <Tooltip title={<div translate={name ? "no" : "yes"}>{name || "User"}</div>}>
        <IconButton
          aria-label="Sidebar"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ zIndex: 1 }}
        >
          <UserAvatar
            src={avatarSrc || undefined}
            alt={name || "User"}
            hasimage={profilePicture !== null}
            pulse={
              user.name === defaultUser.name &&
              user.profilePicture === defaultUser.profilePicture &&
              JSON.stringify(user.settings) === JSON.stringify(defaultUser.settings)
            }
            size="52px"
            onError={() => {
              // This prevents the error handling from being called unnecessarily when offline
              if (!navigator.onLine) return;
              setUser((prevUser) => ({
                ...prevUser,
                profilePicture: null,
              }));
              showToast("Error in profile picture URL", { type: "error" });
              throw new Error("Error in profile picture URL");
            }}
          >
            {name ? name[0].toUpperCase() : undefined}
          </UserAvatar>
        </IconButton>
      </Tooltip>
      <StyledSwipeableDrawer
        disableBackdropTransition={systemInfo.os !== "iOS"}
        disableDiscovery={systemInfo.os === "iOS"}
        id="basic-menu"
        anchor="right"
        open={open}
        onOpen={(e) => e.preventDefault()}
        onClose={handleClose}
      >
        <LogoContainer
          translate="no"
          onClick={() => {
            n("/");
            handleClose();
          }}
        >
          <Logo src="/logo192.png" alt="logo" />
          <LogoText>
            <span>Todo</span> App
            <span>.</span>
          </LogoText>
        </LogoContainer>

        <MenuLink to="/">
          <StyledMenuItem onClick={handleClose}>
            <TaskAltRounded /> &nbsp; Tasks
            {tasks.filter((task) => !task.done).length > 0 && (
              <Tooltip title={`${tasks.filter((task) => !task.done).length} tasks to do`}>
                <MenuLabel>
                  {tasks.filter((task) => !task.done).length > 99
                    ? "99+"
                    : tasks.filter((task) => !task.done).length}
                </MenuLabel>
              </Tooltip>
            )}
          </StyledMenuItem>
        </MenuLink>

        <MenuLink to="/add">
          <StyledMenuItem onClick={handleClose}>
            <AddRounded /> &nbsp; Add Task
          </StyledMenuItem>
        </MenuLink>

        {settings.enableCategories !== undefined && settings.enableCategories && (
          <MenuLink to="/categories">
            <StyledMenuItem onClick={handleClose}>
              <CategoryRounded /> &nbsp; Categories
            </StyledMenuItem>
          </MenuLink>
        )}

        <MenuLink to="/purge">
          <StyledMenuItem onClick={handleClose}>
            <DeleteForeverRounded /> &nbsp; Purge Tasks
          </StyledMenuItem>
        </MenuLink>

        <ProfileOptionsBottom>
          <StyledDivider />
          <MenuLink to="/user">
            <ProfileMenuItem translate={name ? "no" : "yes"} onClick={handleClose}>
              <UserAvatar
                src={avatarSrc || undefined}
                hasimage={profilePicture !== null}
                size="44px"
              >
                {name ? name[0].toUpperCase() : undefined}
              </UserAvatar>
              <h4 style={{ margin: 0, fontWeight: 600 }}> {name || "User"}</h4>{" "}
              {(name === null || name === "") && profilePicture === null && <PulseMenuLabel />}
            </ProfileMenuItem>
          </MenuLink>

          <StyledDivider />
        </ProfileOptionsBottom>
      </StyledSwipeableDrawer>
      <LogoutDialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)} />
    </Container>
  );
};

const MenuLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const styles: React.CSSProperties = { borderRadius: "14px" };
  if (to.startsWith("/") || to === "") {
    return (
      // React Router Link component for internal navigation
      <Link to={to} style={styles}>
        {children}
      </Link>
    );
  }
  // Render an anchor tag for external navigation
  return (
    <a href={to} target="_blank" style={styles}>
      {children}
    </a>
  );
};

const PulseMenuLabel = () => {
  return (
    <StyledPulseMenuLabel>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FiberManualRecord style={{ fontSize: "16px" }} />
      </div>
    </StyledPulseMenuLabel>
  );
};

// TODO: make avatar sticky on pages with TopBar.tsx

const StyledSwipeableDrawer = styled(SwipeableDrawer)`
  & .MuiPaper-root {
    border-radius: 24px 0 0 0;
    min-width: 300px;
    box-shadow: none;
    padding: 4px 12px;
    color: ${({ theme }) => (theme.darkmode ? ColorPalette.fontLight : "#101727")};
    z-index: 999;

    @media (min-width: 1920px) {
      min-width: 310px;
    }

    @media (max-width: 1024px) {
      min-width: 270px;
    }

    @media (max-width: 600px) {
      min-width: 55vw;
    }

    ${({ theme }) => reduceMotion(theme)}
  }
`;

const LogoutAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.9) translateX(-2px);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  /* margin: 0px 8px; */
  padding: 16px 12px;
  border-radius: 14px;
  box-shadow: none;
  font-weight: 500;
  gap: 6px;

  & svg,
  .bmc-icon {
    transition: 0.4s transform;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => (theme.darkmode ? "#fff" : "#000")};
    background: none;
  }

  &:hover {
    & svg.GitHubIcon {
      transform: rotateY(${2 * Math.PI}rad);
    }
    & svg.BugReportRoundedIcon {
      transform: rotate(45deg) scale(1.1) translateY(-10%);
    }

    & svg.LogoutIcon {
      animation: ${LogoutAnimation} 0.5s ease-in alternate;
    }

    & .bmc-icon {
      animation: ${ring} 2.5s ease-in alternate;
    }
  }

  /* disable all animation and transition when user prefers reduced motion */
  &,
  & svg,
  & .bmc-icon {
    ${({ theme }) => reduceMotion(theme, { transform: "none !important" })}
  }
`;

const ProfileMenuItem = styled(StyledMenuItem)`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => (theme.darkmode ? "#1f1f1f" : "#d7d7d7")};
  &:hover {
    background: ${({ theme }) => (theme.darkmode ? "#1f1f1fb2" : "#d7d7d7b2")};
  }
`;

const MenuLabel = styled.span<{ clr?: string }>`
  margin-left: auto;
  font-weight: 600;
  background: ${({ clr, theme }) => (clr || theme.primary) + "35"};
  color: ${({ clr, theme }) => clr || theme.primary};
  padding: 2px 12px;
  border-radius: 32px;
  font-size: 14px;
  & span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
`;

const StyledDivider = styled(Divider)`
  margin: 8px 4px;
`;

const StyledPulseMenuLabel = styled(MenuLabel)`
  animation: ${({ theme }) => pulseAnimation(theme.primary, 6)} 1.2s infinite;
  padding: 6px;
  margin-right: 4px;
  ${({ theme }) => reduceMotion(theme)}
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-top: 8px;
  margin-bottom: 16px;
  gap: 12px;
  cursor: pointer;
`;

const Logo = styled.img`
  width: 52px;
  height: 52px;
  margin-left: 12px;
  border-radius: 14px;
`;

const LogoText = styled.h2`
  & span {
    color: #7764e8;
  }
`;

const ProfileOptionsBottom = styled.div`
  margin-top: auto;
  margin-bottom: ${window.matchMedia("(display-mode: standalone)").matches &&
  /Mobi/.test(navigator.userAgent)
    ? "38px"
    : "16px"};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Container = styled.div`
  position: absolute;
  right: 16vw;
  top: 14px;
  z-index: 900;
  @media (max-width: 1024px) {
    right: 16px;
  }
  @media print {
    display: none;
  }
`;
