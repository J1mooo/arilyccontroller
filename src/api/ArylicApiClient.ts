import { 
  PlayerStatusResponse, 
  DeviceStatusResponse, 
  ApiResponse, 
  InputSource,
  ArylicApiError,
  ConnectionError,
  NetworkError 
} from '../types';

export class ArylicApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(ipAddress: string, timeout: number = 5000) {
    this.baseUrl = `http://${ipAddress}`;
    this.timeout = timeout;
  }

  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: 'success',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ConnectionError('Request timeout - device may be unreachable');
        }
        throw new NetworkError(error.message);
      }
      
      throw new ArylicApiError('Unknown error occurred');
    }
  }

  async getPlayerStatus(): Promise<ApiResponse<PlayerStatusResponse>> {
    return this.makeRequest<PlayerStatusResponse>('/httpapi.asp?command=getPlayerStatus');
  }

  async getDeviceStatus(): Promise<ApiResponse<DeviceStatusResponse>> {
    return this.makeRequest<DeviceStatusResponse>('/httpapi.asp?command=getStatusEx');
  }

  async setVolume(volume: number): Promise<ApiResponse<string>> {
    if (volume < 0 || volume > 100) {
      throw new ArylicApiError('Volume must be between 0 and 100');
    }
    return this.makeRequest<string>(`/httpapi.asp?command=setPlayerCmd:vol:${volume}`);
  }

  async togglePlayPause(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/httpapi.asp?command=setPlayerCmd:onepause');
  }

  async setMute(muted: boolean): Promise<ApiResponse<string>> {
    const muteValue = muted ? '1' : '0';
    return this.makeRequest<string>(`/httpapi.asp?command=setPlayerCmd:mute:${muteValue}`);
  }

  async switchInputSource(source: InputSource): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/httpapi.asp?command=setPlayerCmd:switchmode:${source}`);
  }

  async nextTrack(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/httpapi.asp?command=setPlayerCmd:next');
  }

  async previousTrack(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/httpapi.asp?command=setPlayerCmd:prev');
  }

  async stopPlayback(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/httpapi.asp?command=setPlayerCmd:stop');
  }
}