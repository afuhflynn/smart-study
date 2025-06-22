import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  userAgent: string;
}

export function detectDevice(userAgent: string, ip?: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Format device info
  const device = result.device.model
    ? `${result.device.vendor || ""} ${result.device.model}`.trim()
    : result.device.type || "Desktop";

  const browser = result.browser.name
    ? `${result.browser.name} ${result.browser.version || ""}`.trim()
    : "Unknown Browser";

  const os = result.os.name
    ? `${result.os.name} ${result.os.version || ""}`.trim()
    : "Unknown OS";

  // For location, we'd need a geo-IP service. For now, return IP
  const location = ip ? `IP: ${ip}` : "Unknown Location";

  return {
    device,
    browser,
    os,
    ip: ip || "Unknown IP",
    location,
    userAgent,
  };
}
