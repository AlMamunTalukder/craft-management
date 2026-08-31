/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  alpha,
  MenuItem,
  Box,
} from "@mui/material";
import { ExpandLess, ExpandMore, ArrowForwardIos } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
import React from "react";

// Recursive render for hover popover items (supports nested submenus)
export const renderPopoverItems = (
  items: any[],
  onNavigate: (path: string) => void,
) => {
  return items.map((item) => {
    const hasChildren = !!item.children;
    return (
      <Box key={item.title}>
        <MenuItem
          onClick={() => {
            if (item.path) onNavigate(item.path);
          }}
          sx={{ pl: 2, pr: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.title} />
          {hasChildren && <ExpandMore fontSize="small" />}
        </MenuItem>
        {hasChildren && (
          <Box sx={{ pl: 2 }}>
            {renderPopoverItems(item.children, onNavigate)}
          </Box>
        )}
      </Box>
    );
  });
};

export const NavigationList = ({
  items,
  nested = false,
  open,
  isMobile,
  openItems,
  toggleNested,
  onNavigate,
  onHoverOpen,
  onHoverClose,
  depth = 0,
}: any) => {
  const theme = useTheme();
  const pathname = usePathname();
  const isCollapsed = !open && !isMobile && !nested;

  return items.map((item: any) => {
    const hasChildren = !!item.children;
    const isActive =
      pathname === item.path ||
      (hasChildren && item.children?.some((c: any) => pathname === c.path));
    const isChild = depth > 0;
    const isGrandChild = depth > 1;

    return (
      <React.Fragment key={item.title}>
        <ListItem
          onClick={() => {
            if (open || isMobile) {
              if (hasChildren) {
                toggleNested(item.title);
              } else if (item.path) {
                onNavigate(item.path);
              }
            }
          }}
          onMouseEnter={(e) => onHoverOpen(e, item)}
          onMouseLeave={onHoverClose}
          sx={{
            position: "relative",
            cursor: "pointer",
            borderRadius: depth === 0 ? "10px" : "8px",
            mx: isCollapsed ? 1 : 1,
            my: depth === 0 ? 0.3 : depth === 1 ? 0.2 : 0.15,
            minHeight: isCollapsed ? "60px" : depth === 0 ? "40px" : depth === 1 ? "36px" : "32px",
            py: isCollapsed ? 0.7 : depth === 0 ? 0.7 : depth === 1 ? 0.5 : 0.45,
            px: isCollapsed ? 0.5 : depth === 0 ? 1.2 : depth === 1 ? 1 : 0.9,
            ml: isCollapsed ? 1 : depth === 0 ? 1 : depth === 1 ? 1.5 : 2,
            mr: 1,
            pl: isCollapsed ? 0.5 : depth === 0 ? 1.2 : depth === 1 ? 1.4 : 1.8,
            backgroundColor: isActive ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.08) : "transparent",
            border: isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.15)}` : "1px solid transparent",
            borderLeft: !isCollapsed && isActive && isChild ? `3px solid ${theme.palette.primary.main}` : isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.15)}` : "1px solid transparent",
            "&:hover": {
              backgroundColor: isActive ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12) : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.04),
              borderColor: isActive ? alpha(theme.palette.primary.main, 0.15) : "transparent",
            },
            transition: "all 0.15s ease",
            ...(isCollapsed && {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.3,
            }),
            ...(!isCollapsed && {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: depth === 2 ? 0.4 : 0.6,
            }),
          }}
        >
          {isGrandChild && !isCollapsed && (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.4),
                flexShrink: 0,
                ml: 0.2,
                transition: "all 0.15s ease",
              }}
            />
          )}
          {isChild && !isGrandChild && !isCollapsed && (
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.5),
                flexShrink: 0,
                ml: 0.3,
                opacity: isActive ? 1 : 0.7,
              }}
            />
          )}
          <ListItemIcon
            sx={{
              minWidth: "auto",
              marginRight: !isCollapsed && (isMobile || open) ? (isGrandChild ? 0.6 : isChild ? 0.8 : 1) : 0,
              marginBottom: isCollapsed ? 0.4 : 0,
              color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              justifyContent: "center",
              opacity: isActive ? 1 : isGrandChild ? 0.85 : 1,
              "& svg": { transition: "all 0.15s ease" },
            }}
          >
            {item.icon}
          </ListItemIcon>
          {isMobile || open ? (
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: isGrandChild ? "0.78rem" : isChild ? "0.8125rem" : "0.875rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                letterSpacing: isGrandChild ? "0" : "-0.01em",
                lineHeight: 1.3,
              }}
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                my: 0,
                opacity: isActive ? 1 : isGrandChild ? 0.9 : 1,
              }}
            />
          ) : isCollapsed ? (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.62rem",
                fontWeight: isActive ? 600 : 500,
                maxWidth: "68px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "center",
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                lineHeight: 1.25,
                letterSpacing: "0.01em",
              }}
            >
              {item.title.length > 8
                ? `${item.title.substring(0, 8)}…`
                : item.title}
            </Typography>
          ) : null}
          {isCollapsed && hasChildren && (
            <ArrowForwardIos
              sx={{
                fontSize: "0.65rem",
                position: "absolute",
                top: 18,
                right: 4,
                color: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.6),
                opacity: 0.7,
              }}
            />
          )}
          {hasChildren &&
            (isMobile || open) &&
            (openItems[item.title] ? (
              <ExpandLess sx={{ fontSize: 18, color: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.6) }} />
            ) : (
              <ExpandMore sx={{ fontSize: 18, color: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.6) }} />
            ))}
        </ListItem>
        {hasChildren && (isMobile || open) && (
          <Collapse in={openItems[item.title]} timeout="auto" unmountOnExit>
            <Box
              sx={{
                ml: isCollapsed ? 0 : depth === 0 ? 2.2 : depth === 1 ? 2.8 : 0,
                pl: isCollapsed ? 0 : depth === 0 ? 0.6 : 0.8,
                borderLeft: isCollapsed
                  ? "none"
                  : depth === 0
                    ? `1px solid ${theme.palette.divider}`
                    : depth === 1
                      ? `1px dashed ${alpha(theme.palette.divider, 0.8)}`
                      : "none",
                my: 0.4,
                position: "relative",
              }}
            >
              <List component="div" disablePadding sx={{ py: 0.3 }}>
                <NavigationList
                  items={item.children}
                  nested
                  open={open}
                  isMobile={isMobile}
                  openItems={openItems}
                  toggleNested={toggleNested}
                  onNavigate={onNavigate}
                  onHoverOpen={onHoverOpen}
                  onHoverClose={onHoverClose}
                  depth={depth + 1}
                />
              </List>
            </Box>
          </Collapse>
        )}
      </React.Fragment>
    );
  });
};
