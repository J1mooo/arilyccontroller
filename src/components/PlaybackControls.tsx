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