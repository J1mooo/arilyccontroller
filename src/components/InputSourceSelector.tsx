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