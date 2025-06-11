
// Player Status Response Interface
export interface PlayerStatusResponse {
  type: string;
  ch: string;
  mode: string;
  loop: string;
  eq: string;
  status: 'play' | 'pause' | 'stop' | 'load';
  curpos: string;
  offset_pts: string;
  totlen: string;
  Title: string; // hexed string
  Artist: string; // hexed string
  Album: string; // hexed string
  alarmflag: string;
  plicount: string;
  plicurr: string;
  vol: string;
  mute: '0' | '1';
}

// Device Status Response Interface
export interface DeviceStatusResponse {
  uuid: string;
  DeviceName: string;
  GroupName: string;
  ssid: string;
  language: string;
  firmware: string;
  hardware: string;
  build: 'release' | 'debug' | 'backup';
  project: string;
  priv_prj: string;
  project_build_name: string;
  Release: string;
  temp_uuid: string;
  hideSSID: '0' | '1';
  SSIDStrategy: string;
  branch: string;
  group: string;
  wmrm_version: string;
  internet: '0' | '1';
  MAC: string;
  STA_MAC: string;
  CountryCode: string;
  CountryRegion: string;
  netstat: '0' | '1' | '2';
  essid: string;
  apcli0: string;
  eth2: string;
  ra0: string;
  eth_dhcp: '0' | '1';
  eth_static_ip?: string;
  eth_static_mask?: string;
  eth_static_gateway?: string;
  eth_static_dns1?: string;
  eth_static_dns2?: string;
  VersionUpdate: '0' | '1';
  NewVer: string;
  mcu_ver: string;
  mcu_ver_new: string;
  dsp_ver: string;
  dsp_ver_new: string;
  date: string;
  time: string;
  tz: string;
  dst_enable: string;
  region: string;
  prompt_status: '0' | '1';
  iot_ver: string;
  upnp_version: string;
  cap1: string;
  capability: string;
  languages: string;
  streams_all: string;
  streams: string;
  external: string;
  plm_support: string;
  preset_key: string;
  spotify_active: '0' | '1';
  lbc_support: string;
  privacy_mode: string;
  WifiChannel: string;
  RSSI: string;
  BSSID: string;
  battery: '0' | '1';
  battery_percent: string;
  securemode: string;
  auth: string;
  encry: string;
  upnp_uuid: string;
  uart_pass_port: string;
  communication_port: string;
  web_firmware_update_hide: string;
  ignore_talkstart: string;
  web_login_result: string;
  silenceOTATime: string;
  ignore_silenceOTATime: string;
  new_tunein_preset_and_alarm: string;
  iheartradio_new: string;
  new_iheart_podcast: string;
  tidal_version: string;
  service_version: string;
  security: string;
  security_version: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

// Input Source Types
export type InputSource = 'wifi' | 'line-in' | 'bluetooth' | 'optical' | 'co-axial' | 'udisk' | 'line-in2' | 'PCUSB';

export interface InputSourceOption {
  value: InputSource;
  label: string;
}

// Application State Interfaces
export interface DeviceState {
  ipAddress: string;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  deviceInfo: DeviceStatusResponse | null;
  lastUpdated: Date | null;
}

export interface PlayerState {
  status: 'play' | 'pause' | 'stop' | 'load';
  volume: number;
  isMuted: boolean;
  currentTrack: {
    title: string;
    artist: string;
    album: string;
  } | null;
  inputSource: InputSource;
  playlistCount: number;
  currentTrackIndex: number;
  duration: number;
  position: number;
  isLoading: boolean;
}

// Component Props Interfaces
export interface DeviceConfigurationProps {
  deviceState: DeviceState;
  onConnect: (ipAddress: string) => Promise<void>;
  onDisconnect: () => void;
}

export interface PlaybackControlsProps {
  playerState: PlayerState;
  onPlayPause: () => Promise<void>;
  onNext: () => Promise<void>;
  onPrevious: () => Promise<void>;
  onStop: () => Promise<void>;
  disabled?: boolean;
}

export interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => Promise<void>;
  onMuteToggle: () => Promise<void>;
  disabled?: boolean;
}

export interface InputSourceSelectorProps {
  currentSource: InputSource;
  availableSources: InputSourceOption[];
  onSourceChange: (source: InputSource) => Promise<void>;
  disabled?: boolean;
}

export interface TrackInfoProps {
  track: {
    title: string;
    artist: string;
    album: string;
  } | null;
  duration: number;
  position: number;
  isLoading?: boolean;
}

// Hook Return Types
export interface UseDeviceConnection {
  deviceState: DeviceState;
  connect: (ipAddress: string) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

export interface UsePlayerControl {
  playerState: PlayerState;
  playPause: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  changeInputSource: (source: InputSource) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  stopPlayback: () => Promise<void>;
}

// Error Types
export class ArylicApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ArylicApiError';
  }
}

export class ConnectionError extends ArylicApiError {
  constructor(message: string) {
    super(message, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

export class NetworkError extends ArylicApiError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ArylicApiError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Utility Types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LocalStorageData {
  deviceIP: string;
  lastConnected: string;
}

// Event Handler Types
export type VolumeChangeHandler = (volume: number) => Promise<void>;
export type InputSourceChangeHandler = (source: InputSource) => Promise<void>;
export type PlaybackControlHandler = () => Promise<void>;
export type ConnectionHandler = (ipAddress: string) => Promise<void>;
export type DisconnectionHandler = () => void;

// Configuration Types
export interface ApiEndpoints {
  getPlayerStatus: string;
  getStatusEx: string;
  setVolume: string;
  playPause: string;
  switchMode: string;
  mute: string;
  next: string;
  previous: string;
  stop: string;
}

export interface AppConfig {
  apiEndpoints: ApiEndpoints;
  inputSources: InputSourceOption[];
  pollingInterval: number;
  volumeRange: {
    min: number;
    max: number;
  };
  localStorageKey: string;
  requestTimeout: number;
}

// React Component Types
export interface ArylicControllerAppProps {
  config?: Partial<AppConfig>;
  theme?: 'light' | 'dark' | 'auto';
  onError?: (error: Error) => void;
}

// Async Operation States
export interface AsyncOperationState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IPAddressValidation extends ValidationResult {
  formattedIP?: string;
}