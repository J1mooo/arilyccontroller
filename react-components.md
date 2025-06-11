# React TypeScript Components for Arylic Controller

## Device Configuration Component (components/DeviceConfiguration.tsx)

```typescript
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
```

## Playback Controls Component (components/PlaybackControls.tsx)

```typescript
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  MusicNote as MusicIcon,
} from '@mui/icons-material';
import { PlaybackControlsProps } from '../types';

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onStop,
  disabled = false,
}) => {
  const isPlaying = playerState.status === 'play';
  const canControl = !disabled && !playerState.isLoading;

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicIcon />
          <Typography variant="h6">Playback Controls</Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <IconButton
            onClick={onPrevious}
            disabled={!canControl}
            size="large"
            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
          >
            <PreviousIcon />
          </IconButton>

          <IconButton
            onClick={onPlayPause}
            disabled={!canControl}
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'action.disabledBackground' },
              width: 56,
              height: 56,
            }}
          >
            {playerState.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </IconButton>

          <IconButton
            onClick={onNext}
            disabled={!canControl}
            size="large"
            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
          >
            <NextIcon />
          </IconButton>

          <IconButton
            onClick={onStop}
            disabled={!canControl}
            size="large"
            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
          >
            <StopIcon />
          </IconButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status: {playerState.status.charAt(0).toUpperCase() + playerState.status.slice(1)}
          </Typography>
          {playerState.playlistCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              Track {playerState.currentTrackIndex} of {playerState.playlistCount}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
```

## Volume Control Component (components/VolumeControl.tsx)

```typescript
import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  VolumeMute as VolumeMuteIcon,
} from '@mui/icons-material';
import { VolumeControlProps } from '../types';
import { debounce } from '../utils';

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}) => {
  const [localVolume, setLocalVolume] = useState<number>(volume);

  // Debounced volume change to avoid too many API calls
  const debouncedVolumeChange = useCallback(
    debounce((newVolume: number) => {
      onVolumeChange(newVolume);
    }, 300),
    [onVolumeChange]
  );

  const handleVolumeChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      const volumeValue = Array.isArray(newValue) ? newValue[0] : newValue;
      setLocalVolume(volumeValue);
      debouncedVolumeChange(volumeValue);
    },
    [debouncedVolumeChange]
  );

  const handleVolumeCommitted = useCallback(
    (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
      const volumeValue = Array.isArray(newValue) ? newValue[0] : newValue;
      onVolumeChange(volumeValue);
    },
    [onVolumeChange]
  );

  const getVolumeIcon = () => {
    if (isMuted) return <VolumeMuteIcon />;
    if (volume === 0) return <VolumeOffIcon />;
    if (volume < 50) return <VolumeDownIcon />;
    return <VolumeUpIcon />;
  };

  const displayVolume = isMuted ? 0 : localVolume;

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {getVolumeIcon()}
          <Typography variant="h6">Volume Control</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              onClick={onMuteToggle}
              disabled={disabled}
              color={isMuted ? 'error' : 'default'}
            >
              {isMuted ? <VolumeMuteIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, mx: 2 }}>
            <Slider
              value={displayVolume}
              onChange={handleVolumeChange}
              onChangeCommitted={handleVolumeCommitted}
              min={0}
              max={100}
              disabled={disabled || isMuted}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              sx={{
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(33, 128, 141, 0.16)',
                  },
                },
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
            {Math.round(displayVolume)}%
          </Typography>
        </Box>

        {isMuted && (
          <Typography variant="body2" color="error" sx={{ textAlign: 'center', mt: 1 }}>
            Audio is muted
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
```

## Input Source Selector Component (components/InputSourceSelector.tsx)

```typescript
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import {
  Input as InputIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Cable as CableIcon,
  Usb as UsbIcon,
  RadioButtonChecked as OpticalIcon,
} from '@mui/icons-material';
import { InputSourceSelectorProps, InputSource } from '../types';

const getSourceIcon = (source: InputSource) => {
  switch (source) {
    case 'wifi':
      return <WifiIcon fontSize="small" />;
    case 'bluetooth':
      return <BluetoothIcon fontSize="small" />;
    case 'line-in':
    case 'line-in2':
      return <CableIcon fontSize="small" />;
    case 'optical':
    case 'co-axial':
      return <OpticalIcon fontSize="small" />;
    case 'udisk':
    case 'PCUSB':
      return <UsbIcon fontSize="small" />;
    default:
      return <InputIcon fontSize="small" />;
  }
};

export const InputSourceSelector: React.FC<InputSourceSelectorProps> = ({
  currentSource,
  availableSources,
  onSourceChange,
  disabled = false,
}) => {
  const handleSourceChange = (event: SelectChangeEvent<InputSource>) => {
    const newSource = event.target.value as InputSource;
    onSourceChange(newSource);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InputIcon />
          <Typography variant="h6">Input Source</Typography>
        </Box>

        <FormControl fullWidth>
          <Select
            value={currentSource}
            onChange={handleSourceChange}
            disabled={disabled}
            displayEmpty
            renderValue={(selected) => {
              const selectedSource = availableSources.find(source => source.value === selected);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSourceIcon(selected)}
                  {selectedSource?.label || 'Unknown Source'}
                </Box>
              );
            }}
          >
            {availableSources.map((source) => (
              <MenuItem key={source.value} value={source.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSourceIcon(source.value)}
                  {source.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Current input: {availableSources.find(s => s.value === currentSource)?.label || currentSource}
        </Typography>
      </CardContent>
    </Card>
  );
};
```

## Track Info Component (components/TrackInfo.tsx)

```typescript
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  Person as ArtistIcon,
  Album as AlbumIcon,
} from '@mui/icons-material';
import { TrackInfoProps } from '../types';
import { formatTime } from '../utils';

export const TrackInfo: React.FC<TrackInfoProps> = ({
  track,
  duration,
  position,
  isLoading = false,
}) => {
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNoteIcon />
            <Typography variant="h6">Now Playing</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" height={32} />
            <Skeleton variant="text" height={24} width="60%" />
            <Skeleton variant="text" height={24} width="40%" />
          </Box>
          <Skeleton variant="rectangular" height={8} />
        </CardContent>
      </Card>
    );
  }

  if (!track) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNoteIcon />
            <Typography variant="h6">Now Playing</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            No track information available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNoteIcon />
          <Typography variant="h6">Now Playing</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {track.title || 'Unknown Title'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ArtistIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" color="text.secondary">
              {track.artist || 'Unknown Artist'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlbumIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {track.album || 'Unknown Album'}
            </Typography>
          </Box>
        </Box>

        {duration > 0 && (
          <Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {formatTime(position)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

## Package.json Dependencies

```json
{
  "name": "arylic-controller-typescript",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.38",
    "@types/react-dom": "^18.2.17",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^5.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## TSConfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "src"
  ]
}
```