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