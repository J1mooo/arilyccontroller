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