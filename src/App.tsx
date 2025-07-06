import React, { useState, useEffect, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  PlayerStatusResponse, 
  DeviceState, 
  PlayerState, 
  InputSource,
  ArylicApiError,
  AppConfig 
} from './types';
import { ArylicApiClient } from './api/ArylicApiClient';
import { DeviceConfiguration } from './components/DeviceConfiguration';
import { PlaybackControls } from './components/PlaybackControls';
import { VolumeControl } from './components/VolumeControl';
import { InputSourceSelector } from './components/InputSourceSelector';
import { TrackInfo } from './components/TrackInfo';
import { hexToAscii, validateIPAddress, getStoredDeviceIP, setStoredDeviceIP } from './utils';

// MUI Theme Configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#21808d',
    },
    secondary: {
      main: '#5e5240',
    },
    background: {
      default: '#fcfcf9',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Default configuration
const defaultConfig: AppConfig = {
  apiEndpoints: {
    getPlayerStatus: '/httpapi.asp?command=getPlayerStatus',
    getStatusEx: '/httpapi.asp?command=getStatusEx',
    setVolume: '/httpapi.asp?command=setPlayerCmd:vol:',
    playPause: '/httpapi.asp?command=setPlayerCmd:onepause',
    switchMode: '/httpapi.asp?command=setPlayerCmd:switchmode:',
    mute: '/httpapi.asp?command=setPlayerCmd:mute:',
    next: '/httpapi.asp?command=setPlayerCmd:next',
    previous: '/httpapi.asp?command=setPlayerCmd:prev',
    stop: '/httpapi.asp?command=setPlayerCmd:stop',
  },
  inputSources: [
    { value: 'wifi', label: 'WiFi Mode' },
    { value: 'line-in', label: 'Line Input' },
    { value: 'bluetooth', label: 'Bluetooth' },
    { value: 'optical', label: 'Optical Input' },
    { value: 'co-axial', label: 'Coaxial Input' },
    { value: 'udisk', label: 'USB Disk' },
  ],
  pollingInterval: 1000,
  volumeRange: { min: 0, max: 100 },
  localStorageKey: 'arylic_device_ip',
  requestTimeout: 5000,
};

export const ArylicControllerApp: React.FC = () => {
  // State management with proper TypeScript typing
  const [deviceState, setDeviceState] = useState<DeviceState>({
    ipAddress: '',
    isConnected: false,
    isLoading: false,
    error: null,
    deviceInfo: null,
    lastUpdated: null,
  });

  const [playerState, setPlayerState] = useState<PlayerState>({
    status: 'stop',
    volume: 50,
    isMuted: false,
    currentTrack: null,
    inputSource: 'wifi',
    playlistCount: 0,
    currentTrackIndex: 0,
    duration: 0,
    position: 0,
    isLoading: false,
  });

  const [apiClient, setApiClient] = useState<ArylicApiClient | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Load stored IP address on component mount
  useEffect(() => {
    const storedIP = getStoredDeviceIP();
    if (storedIP && validateIPAddress(storedIP).isValid) {
      setDeviceState(prev => ({ ...prev, ipAddress: storedIP }));
    }
  }, []);

  // Show snackbar message
  const showMessage = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Update player state from API response
  const updatePlayerState = useCallback((response: PlayerStatusResponse) => {
    const currentTrack = response.Title && response.Title !== '' ? {
      title: hexToAscii(response.Title),
      artist: hexToAscii(response.Artist),
      album: hexToAscii(response.Album),
    } : null;

    setPlayerState(prev => ({
      ...prev,
      status: response.status,
      volume: parseInt(response.vol, 10),
      isMuted: response.mute === '1',
      currentTrack,
      playlistCount: parseInt(response.plicount, 10),
      currentTrackIndex: parseInt(response.plicurr, 10),
      duration: parseInt(response.totlen, 10),
      position: parseInt(response.curpos, 10),
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    if (!apiClient || !deviceState.isConnected) {
      return;
    }

    // Start polling immediately
    pollDeviceStatus();
    
    // Set up interval
    const intervalId = setInterval(pollDeviceStatus, defaultConfig.pollingInterval);
    
    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [apiClient, deviceState.isConnected, updatePlayerState]);

  // Poll device status
  const pollDeviceStatus = useCallback(async () => {
    if (!apiClient || !deviceState.isConnected) return;

    try {
      const response = await apiClient.getPlayerStatus();
      if (response.data) {
        updatePlayerState(response.data);
        setDeviceState(prev => ({ 
          ...prev, 
          error: null, 
          lastUpdated: new Date() 
        }));
      }
    } catch (error) {
      console.error('Polling error:', error);
      if (error instanceof ArylicApiError) {
        setDeviceState(prev => ({ 
          ...prev, 
          error: error.message 
        }));
      }
    }
  }, [apiClient, deviceState.isConnected, updatePlayerState]);

  // Connect to device
  const handleConnect = useCallback(async (ipAddress: string) => {
    const validation = validateIPAddress(ipAddress);
    if (!validation.isValid) {
      showMessage('Please enter a valid IP address', 'error');
      return;
    }

    setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = new ArylicApiClient(ipAddress);
      
      // Test connection by getting device status
      const deviceResponse = await client.getDeviceStatus();
      if (!deviceResponse.data) {
        throw new Error('Failed to retrieve device information');
      }

      // Get initial player status
      const playerResponse = await client.getPlayerStatus();
      if (playerResponse.data) {
        updatePlayerState(playerResponse.data);
      }

      setApiClient(client);
      setDeviceState(prev => ({
        ...prev,
        ipAddress,
        isConnected: true,
        isLoading: false,
        error: null,
        deviceInfo: deviceResponse.data ?? null,
        lastUpdated: new Date(),
      }));

      // Store IP address
      setStoredDeviceIP(ipAddress);
      
      showMessage('Successfully connected to device', 'success');
    } catch (error) {
      console.error('Connection error:', error);
      setDeviceState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
      showMessage('Failed to connect to device', 'error');
    }
  }, [updatePlayerState, showMessage]);

  // Disconnect from device
  const handleDisconnect = useCallback(() => {
    setApiClient(null);
    setDeviceState(prev => ({
      ...prev,
      isConnected: false,
      deviceInfo: null,
      error: null,
    }));
    setPlayerState(prev => ({
      ...prev,
      status: 'stop',
      currentTrack: null,
      isLoading: false,
    }));
    showMessage('Disconnected from device', 'info');
  }, [showMessage]);

  // Play/Pause control
  const handlePlayPause = useCallback(async () => {
    if (!apiClient) return;

    setPlayerState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await apiClient.togglePlayPause();
      // State will be updated by next polling cycle
      setTimeout(() => {
        setPlayerState(prev => ({ ...prev, isLoading: false }));
      }, 500);
    } catch (error) {
      console.error('Play/pause error:', error);
      setPlayerState(prev => ({ ...prev, isLoading: false }));
      showMessage('Failed to control playback', 'error');
    }
  }, [apiClient, showMessage]);

  // Volume control
  const handleVolumeChange = useCallback(async (volume: number) => {
    if (!apiClient) return;

    try {
      await apiClient.setVolume(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Volume control error:', error);
      showMessage('Failed to adjust volume', 'error');
    }
  }, [apiClient, showMessage]);

  // Mute toggle
  const handleMuteToggle = useCallback(async () => {
    if (!apiClient) return;

    try {
      const newMuteState = !playerState.isMuted;
      await apiClient.setMute(newMuteState);
      setPlayerState(prev => ({ ...prev, isMuted: newMuteState }));
    } catch (error) {
      console.error('Mute toggle error:', error);
      showMessage('Failed to toggle mute', 'error');
    }
  }, [apiClient, playerState.isMuted, showMessage]);

  // Input source change
  const handleInputSourceChange = useCallback(async (source: InputSource) => {
    if (!apiClient) return;

    try {
      await apiClient.switchInputSource(source);
      setPlayerState(prev => ({ ...prev, inputSource: source }));
      showMessage(`Switched to ${source}`, 'success');
    } catch (error) {
      console.error('Input source change error:', error);
      showMessage('Failed to change input source', 'error');
    }
  }, [apiClient, showMessage]);

  // Next track
  const handleNextTrack = useCallback(async () => {
    if (!apiClient) return;

    try {
      await apiClient.nextTrack();
    } catch (error) {
      console.error('Next track error:', error);
      showMessage('Failed to skip to next track', 'error');
    }
  }, [apiClient, showMessage]);

  // Previous track
  const handlePreviousTrack = useCallback(async () => {
    if (!apiClient) return;

    try {
      await apiClient.previousTrack();
    } catch (error) {
      console.error('Previous track error:', error);
      showMessage('Failed to skip to previous track', 'error');
    }
  }, [apiClient, showMessage]);

  // Stop playback
  const handleStopPlayback = useCallback(async () => {
    if (!apiClient) return;

    try {
      await apiClient.stopPlayback();
    } catch (error) {
      console.error('Stop playback error:', error);
      showMessage('Failed to stop playback', 'error');
    }
  }, [apiClient, showMessage]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Arylic UP2Stream Amp Controller
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Control your Arylic audio device remotely
          </Typography>
        </Box>

        {/* Device Configuration */}
        <DeviceConfiguration
          deviceState={deviceState}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        {/* Main Controls - Only show when connected */}
        {deviceState.isConnected && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Track Information */}
            <TrackInfo
              track={playerState.currentTrack}
              duration={playerState.duration}
              position={playerState.position}
              isLoading={playerState.isLoading}
            />

            {/* Playback Controls */}
            <PlaybackControls
              playerState={playerState}
              onPlayPause={handlePlayPause}
              onNext={handleNextTrack}
              onPrevious={handlePreviousTrack}
              onStop={handleStopPlayback}
            />

            {/* Volume Control */}
            <VolumeControl
              volume={playerState.volume}
              isMuted={playerState.isMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
            />

            {/* Input Source Selector */}
            <InputSourceSelector
              currentSource={playerState.inputSource}
              availableSources={defaultConfig.inputSources}
              onSourceChange={handleInputSourceChange}
            />
          </Box>
        )}

        {/* Error Display */}
        {deviceState.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deviceState.error}
          </Alert>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert 
            severity={snackbarSeverity} 
            onClose={() => setSnackbarOpen(false)}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ArylicControllerApp;
