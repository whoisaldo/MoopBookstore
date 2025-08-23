import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, CircularProgress } from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import apiClient from '../utils/api';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  timestamp: string;
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking API health...',
    timestamp: new Date().toISOString()
  });

  const checkHealth = async () => {
    try {
      setHealth({
        status: 'checking',
        message: 'Checking API health...',
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.get('/health');
      const data = response.data;

      if (data.status === 'OK') {
        setHealth({
          status: 'healthy',
          message: `API Healthy - DB: ${data.database}`,
          timestamp: new Date().toISOString()
        });
      } else {
        setHealth({
          status: 'warning',
          message: `API Warning - ${data.status}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      setHealth({
        status: 'error',
        message: `API Error - ${error.message || 'Connection failed'}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      default:
        return <CircularProgress size={16} />;
    }
  };

  return (
    <Tooltip title={`${health.message}\nLast checked: ${new Date(health.timestamp).toLocaleTimeString()}`}>
      <Box>
        <Chip
          icon={getStatusIcon()}
          label={health.status === 'checking' ? 'Checking...' : health.status}
          color={getStatusColor()}
          size="small"
          variant="outlined"
          onClick={checkHealth}
          sx={{ cursor: 'pointer' }}
        />
      </Box>
    </Tooltip>
  );
};

export default HealthCheck;
