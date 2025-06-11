import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DeviceConfigurationProps } from '../types';
import { validateIPAddress } from '../utils';

export const DeviceConfiguration: React.FC<DeviceConfigurationProps> = ({
  deviceState,
  onConnect,
  onDisconnect,
}) => {
  const [ipInput, setIpInput] = useState<string>(deviceState.ipAddress);
  const [validationError, setValidationError] = useState<string>('');

  const handleIpChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIpInput(value);
    
    if (value && !validateIPAddress(value).isValid) {
      setValidationError('Please enter a valid IP address');
    } else {
      setValidationError('');
    }
  }, []);

  const handleConnect = useCallback(async () => {
    const validation = validateIPAddress(ipInput);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      return;
    }

    try {
      await onConnect(ipInput);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [ipInput, onConnect]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !deviceState.isLoading && !validationError) {
      handleConnect();
    }
  }, [handleConnect, deviceState.isLoading, validationError]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant="h6">Device Configuration</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Device IP Address"
            value={ipInput}
            onChange={handleIpChange}
            onKeyPress={handleKeyPress}
            placeholder="192.168.1.100"
            error={!!validationError}
            helperText={validationError || 'Enter the IP address of your Arylic device'}
            disabled={deviceState.isLoading || deviceState.isConnected}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {deviceState.isConnected ? <WifiIcon /> : <WifiOffIcon />}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {deviceState.isConnected ? (
            <Button
              variant="outlined"
              color="secondary"
              onClick={onDisconnect}
              startIcon={<WifiOffIcon />}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnect}
              disabled={deviceState.isLoading || !!validationError || !ipInput}
              startIcon={deviceState.isLoading ? <CircularProgress size={20} /> : <WifiIcon />}
            >
              {deviceState.isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}

          <Chip
            label={deviceState.isConnected ? 'Connected' : 'Disconnected'}
            color={deviceState.isConnected ? 'success' : 'default'}
            variant={deviceState.isConnected ? 'filled' : 'outlined'}
          />
        </Box>

        {deviceState.deviceInfo && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Device Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
              <Box>
                <strong>Name:</strong> {deviceState.deviceInfo.DeviceName}
              </Box>
              <Box>
                <strong>Firmware:</strong> {deviceState.deviceInfo.firmware}
              </Box>
              <Box>
                <strong>Hardware:</strong> {deviceState.deviceInfo.hardware}
              </Box>
              <Box>
                <strong>MAC:</strong> {deviceState.deviceInfo.MAC}
              </Box>
            </Box>
          </Box>
        )}

        {deviceState.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deviceState.error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};