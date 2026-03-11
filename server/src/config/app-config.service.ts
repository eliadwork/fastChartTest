import { Injectable } from '@nestjs/common';

const DEFAULT_PORT = 4000;

@Injectable()
export class AppConfigService {
  getPort() {
    const configuredPort = process.env.PORT;
    if (configuredPort == null || configuredPort.trim() === '') {
      return DEFAULT_PORT;
    }

    const parsedPort = Number(configuredPort);
    if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
      return DEFAULT_PORT;
    }

    return parsedPort;
  }
}
