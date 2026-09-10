import React, { useEffect, useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import CollapsibleSidebar, {
  COLLAPSED_SIDEBAR_WIDTH,
  EXPANDED_SIDEBAR_WIDTH,
} from './CollapsibleSidebar';
import Header from './Header';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/authSlice';

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Desktop Sidebar */}
      <CollapsibleSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Mobile Drawer Navigation */}
      <CollapsibleSidebar
        collapsed={!mobileOpen}
        onToggleCollapse={() => {}}
        isMobile
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Header Bar */}
      <Header
        sidebarCollapsed={collapsed}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Main Content Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: 'width 0.2s ease-in-out, margin 0.2s ease-in-out',
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 70 } }} />

        <Box
          className="fade-in"
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1440,
            width: '100%',
            mx: 'auto',
            flexGrow: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
