import { ValidationResult, IPAddressValidation, LocalStorageData } from '../types';

/**
 * Convert hexadecimal string to ASCII text
 */
export function hexToAscii(hexString: string): string {
  if (!hexString || hexString === '') return '';
  
  try {
    let result = '';
    for (let i = 0; i < hexString.length; i += 2) {
      const hex = hexString.substr(i, 2);
      result += String.fromCharCode(parseInt(hex, 16));
    }
    return result;
  } catch (error) {
    console.warn('Failed to decode hex string:', hexString);
    return hexString;
  }
}

/**
 * Convert ASCII text to hexadecimal string
 */
export function asciiToHex(asciiString: string): string {
  if (!asciiString) return '';
  
  let result = '';
  for (let i = 0; i < asciiString.length; i++) {
    const hex = asciiString.charCodeAt(i).toString(16).toUpperCase();
    result += hex.padStart(2, '0');
  }
  return result;
}

/**
 * Validate IP address format
 */
export function validateIPAddress(ip: string): IPAddressValidation {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!ip || ip.trim() === '') {
    return {
      isValid: false,
      errors: ['IP address is required'],
    };
  }

  const trimmedIP = ip.trim();
  
  if (!ipRegex.test(trimmedIP)) {
    return {
      isValid: false,
      errors: ['Invalid IP address format'],
    };
  }

  return {
    isValid: true,
    errors: [],
    formattedIP: trimmedIP,
  };
}

/**
 * Get stored device IP from localStorage
 */
export function getStoredDeviceIP(): string | null {
  try {
    const stored = localStorage.getItem('arylic_device_ip');
    if (stored) {
      const data: LocalStorageData = JSON.parse(stored);
      return data.deviceIP;
    }
  } catch (error) {
    console.warn('Failed to retrieve stored device IP:', error);
  }
  return null;
}

/**
 * Store device IP in localStorage
 */
export function setStoredDeviceIP(ip: string): void {
  try {
    const data: LocalStorageData = {
      deviceIP: ip,
      lastConnected: new Date().toISOString(),
    };
    localStorage.setItem('arylic_device_ip', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to store device IP:', error);
  }
}

/**
 * Format time in milliseconds to MM:SS format
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if device is likely reachable
 */
export function isValidNetworkIP(ip: string): boolean {
  const validation = validateIPAddress(ip);
  if (!validation.isValid) return false;
  
  const parts = ip.split('.').map(Number);
  
  // Check for common private network ranges
  if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.x.x
  if (parts[0] === 10) return true; // 10.x.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16-31.x.x
  
  // Allow localhost for testing
  if (ip === '127.0.0.1') return true;
  
  return false;
}