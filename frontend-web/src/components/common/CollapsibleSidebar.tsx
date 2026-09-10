import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  DashboardOutlined,
  AddCircleOutline,
  HistoryOutlined,
  AssessmentOutlined,
  Inventory2Outlined,
  ReportProblemOutlined,
  BarChartOutlined,
  SettingsOutlined,
  ChevronLeft,
  ChevronRight,
  ShieldOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { initials } from '../../utils/helpers';

export const EXPANDED_SIDEBAR_WIDTH = 250;
export const COLLAPSED_SIDEBAR_WIDTH = 72;

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
  { label: 'New Scan', path: '/scan/new', icon: <AddCircleOutline /> },
  { label: 'Scan History', path: '/scans', icon: <HistoryOutlined /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentOutlined /> },
  { label: 'Products', path: '/products', icon: <Inventory2Outlined /> },
  { label: 'Violations', path: '/violations', icon: <ReportProblemOutlined /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChartOutlined /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlined /> },
];

interface CollapsibleSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const sidebarWidth = collapsed && !isMobile ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          px: collapsed && !isMobile ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              width: 36,
              height: 36,
              fontSize: 18,
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
            }}
          >
            <ShieldOutlined fontSize="small" />
          </Avatar>
          {(!collapsed || isMobile) && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, leading: 1, letterSpacing: '-0.02em', fontSize: '1rem' }}>
                Legal Metrix
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.6875rem' }}>
                Compliance Platform
              </Typography>
            </Box>
          )}
        </Box>

        {!isMobile && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton onClick={onToggleCollapse} size="small" sx={{ color: '#64748B' }}>
              {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Primary Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const button = (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onCloseMobile}
              selected={active}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                px: collapsed && !isMobile ? 1.5 : 2,
                py: 1,
                minHeight: 44,
                justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                transition: 'all 0.15s ease',
                '&.Mui-selected': {
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                  '&:hover': { bgcolor: '#1E293B' },
                },
                '&:hover': {
                  bgcolor: active ? '#1E293B' : '#F1F5F9',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 36,
                  mr: collapsed && !isMobile ? 0 : 1,
                  justifyContent: 'center',
                  color: active ? '#FFFFFF' : '#64748B',
                }}
              >
                {item.icon}
              </ListItemIcon>

              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                  }}
                />
              )}
            </ListItemButton>
          );

          if (collapsed && !isMobile) {
            return (
              <Tooltip key={item.path} title={item.label} placement="right" arrow>
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </List>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* User Account / Footer */}
      <Box sx={{ p: collapsed && !isMobile ? 1.5 : 2 }}>
        {collapsed && !isMobile ? (
          <Tooltip title={`${user?.full_name || 'User'} (${user?.role || 'Inspector'})`} placement="right" arrow>
            <IconButton onClick={handleLogout} color="error" size="small" sx={{ width: '100%', py: 1 }}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {initials(user?.full_name || 'User')}
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {user?.full_name || 'Inspector'}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#64748B', display: 'block', fontSize: '0.71875rem' }}>
                  {user?.email || 'user@nirikshan.test'}
                </Typography>
              </Box>
              {user?.role && (
                <Chip
                  label={user.role.toUpperCase()}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    bgcolor: user.role === 'admin' ? '#FEF3C7' : '#E0F2FE',
                    color: user.role === 'admin' ? '#92400E' : '#075985',
                  }}
                />
              )}
            </Box>

            <Button
              variant="outlined"
              size="small"
              color="inherit"
              fullWidth
              startIcon={<LogoutOutlined fontSize="small" />}
              onClick={handleLogout}
              sx={{
                borderColor: '#E2E8F0',
                color: '#64748B',
                fontSize: '0.78125rem',
                py: 0.6,
                '&:hover': {
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  bgcolor: '#FEF2F2',
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={!collapsed}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: EXPANDED_SIDEBAR_WIDTH,
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.2s ease-in-out',
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid #E2E8F0',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default CollapsibleSidebar;
