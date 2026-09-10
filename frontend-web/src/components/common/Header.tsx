import React, { useState } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AddCircleOutline,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { initials } from '../../utils/helpers';
import { COLLAPSED_SIDEBAR_WIDTH, EXPANDED_SIDEBAR_WIDTH } from './CollapsibleSidebar';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Compliance Overview',
    subtitle: 'Monitor label scans, compliance status, violations and regulatory findings.',
  },
  '/scan/new': {
    title: 'New Compliance Scan',
    subtitle: 'Upload a product package photo to perform instant Legal Metrology OCR analysis.',
  },
  '/scans': {
    title: 'Scan Audit History',
    subtitle: 'Browse and search historical packaging compliance verification records.',
  },
  '/reports': {
    title: 'Compliance Reports',
    subtitle: 'Generate executive audit summaries and export official PDF compliance reports.',
  },
  '/products': {
    title: 'Products Catalog',
    subtitle: 'Manage registered products and view historical scan records per SKU.',
  },
  '/violations': {
    title: 'Violation Management',
    subtitle: 'Track non-compliant packaging items and review manufacturer recommendations.',
  },
  '/analytics': {
    title: 'Analytics & Trends',
    subtitle: 'Analyze 30-day compliance rates, top rule violations, and severity distributions.',
  },
  '/settings': {
    title: 'Platform Settings',
    subtitle: 'Configure inspector profile, scan options, and system rule specifications.',
  },
};

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPath = location.pathname;
  let pageInfo = PAGE_TITLES[currentPath];
  if (!pageInfo) {
    if (currentPath.startsWith('/scans/')) {
      pageInfo = {
        title: 'Scan Audit Result',
        subtitle: 'Detailed Legal Metrology rule check output, OCR text, and findings.',
      };
    } else {
      pageInfo = {
        title: 'Legal Metrix Scanner',
        subtitle: 'Legal Metrology (Packaged Commodities) Rules, 2011 Verification Platform',
      };
    }
  }

  const sidebarWidth = sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scans?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
        ml: { xs: 0, md: `${sidebarWidth}px` },
        transition: 'width 0.2s ease-in-out, margin 0.2s ease-in-out',
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          justify: 'space-between',
          minHeight: { xs: 64, md: 70 },
          px: { xs: 2, md: 3 },
          gap: 2,
        }}
      >
        {/* Mobile drawer toggle */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMobileMenuToggle}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Context Title & Subtitle */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: '#0F172A',
            }}
          >
            {pageInfo.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.75rem',
              mt: 0.25,
            }}
          >
            {pageInfo.subtitle}
          </Typography>
        </Box>

        {/* Header Right Actions & Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Global Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              width: 240,
              '&:focus-within': {
                borderColor: '#0F172A',
                bgcolor: '#FFFFFF',
              },
            }}
          >
            <SearchIcon sx={{ color: '#94A3B8', fontSize: 18, mr: 1 }} />
            <InputBase
              placeholder="Search scans, OCR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ fontSize: '0.8125rem', width: '100%' }}
            />
          </Box>

          {/* Quick Action: New Scan */}
          {location.pathname !== '/scan/new' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleOutline />}
              onClick={() => navigate('/scan/new')}
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8125rem',
                py: 0.8,
                px: 2,
                borderRadius: 1.5,
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)',
                '&:hover': {
                  bgcolor: '#1E293B',
                },
              }}
            >
              New Scan
            </Button>
          )}

          {/* User Profile Menu Trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  border: '2px solid #E2E8F0',
                }}
              >
                {initials(user?.full_name || 'User')}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.full_name || 'Inspector'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {user?.email || ''}
                </Typography>
                {user?.role && (
                  <Chip
                    label={user.role.toUpperCase()}
                    size="small"
                    sx={{
                      mt: 1,
                      height: 18,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      bgcolor: '#F1F5F9',
                    }}
                  />
                )}
              </Box>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
                Settings & Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
