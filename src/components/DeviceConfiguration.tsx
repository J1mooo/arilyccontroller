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
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { DeviceConfigurationProps } from '../types';
import { validateIPAddress } from '../utils';
import { ArylicApiClient } from '../api/ArylicApiClient';

export const DeviceConfiguration: React.FC<DeviceConfigurationProps> = ({
  deviceState,
  onConnect,
  onDisconnect,
}) => {
  const [ipInput, setIpInput] = useState<string>(deviceState.ipAddress);
  const [validationError, setValidationError] = useState<string>('');
  const [hostIp, setHostIp] = useState<string>('');
  const [hostIpError, setHostIpError] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleIpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIpInput(val);
    setValidationError(val && !validateIPAddress(val).isValid
      ? 'Please enter a valid IP address'
      : '');
  }, []);

  const handleConnectClick = useCallback(async () => {
    const v = validateIPAddress(ipInput);
    if (!v.isValid) {
      setValidationError(v.errors[0]);
      return;
    }
    try {
      await onConnect(ipInput);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }, [ipInput, onConnect]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !deviceState.isLoading && !validationError) {
      handleConnectClick();
    }
  }, [handleConnectClick, deviceState.isLoading, validationError]);

  const handleHostIpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHostIp(val);
    setHostIpError(val && !validateIPAddress(val).isValid
      ? 'Enter a valid host IP'
      : '');
  }, []);

  const handleJoinGuest = useCallback(async () => {
    const v = validateIPAddress(hostIp);
    if (!v.isValid) {
      setHostIpError(v.errors[0]);
      return;
    }
    setIsJoining(true);
    try {
      if (!deviceState.ipAddress) throw new Error('Device not connected');
      const client = new ArylicApiClient(deviceState.ipAddress);
      await client.joinMultiroomGroup(hostIp);
      setHostIp('');
      alert(`Joined multiroom group at ${hostIp}`);
    } catch (err: any) {
      console.error('Join failed:', err);
      alert(`Failed to join: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  }, [hostIp, deviceState.ipAddress]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant="h6">Device Configuration</Typography>
        </Box>

        {/* Device IP Input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Device IP Address"
            value={ipInput}
            onChange={handleIpChange}
            onKeyPress={handleKeyPress}
            placeholder="192.168.1.100"
            error={!!validationError}
            helperText={validationError || 'Enter the IP of your Arylic device'}
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

        {/* Connect/Disconnect Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
              onClick={handleConnectClick}
              disabled={deviceState.isLoading || !!validationError || !ipInput}
              startIcon={
                deviceState.isLoading
                  ? <CircularProgress size={20} />
                  : <WifiIcon />
              }
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

        {/* Join Guest Controls */}
        {deviceState.isConnected && (
          <Box sx={{ mb: 2, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle2" gutterBottom>
              Multiroom Group (Guest)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TextField
                label="Host IP Address"
                value={hostIp}
                onChange={handleHostIpChange}
                placeholder="192.168.1.10"
                error={!!hostIpError}
                helperText={hostIpError || 'Enter the device IP you want to add to the group'}
                size="small"
                fullWidth
                disabled={isJoining}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinGuest}
                disabled={!hostIp || !!hostIpError || isJoining}
                startIcon={
                  isJoining
                    ? <CircularProgress size={20} />
                    : <GroupAddIcon />
                }
              >
                {isJoining ? 'Joining…' : 'Join as Guest'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Device Info */}
        {deviceState.deviceInfo && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Device Information
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              fontSize: '0.875rem',
            }}>
              <Box><strong>Name:</strong> {deviceState.deviceInfo.DeviceName}</Box>
              <Box><strong>Firmware:</strong> {deviceState.deviceInfo.firmware}</Box>
              <Box><strong>Hardware:</strong> {deviceState.deviceInfo.hardware}</Box>
              <Box><strong>MAC:</strong> {deviceState.deviceInfo.MAC}</Box>
            </Box>
          </Box>
        )}

        {/* Connection Error */}
        {deviceState.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deviceState.error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
