// backend/src/sftp/sftp.controller.ts

import { Controller, Get } from "@nestjs/common";
import { SftpService } from "./sftp.service";
import { SftpCredential } from "../config/sftp/sftp.types";

type PublicSftpServer = Pick<
  SftpCredential,
  "id" | "host" | "port" | "authMode" | "username"
>;

@Controller("sftp")
export class SftpController {
  constructor(private readonly sftpService: SftpService) {}

  @Get("servers")
  getServers(): { servers: PublicSftpServer[]; count: number } {
    const servers = this.sftpService.getServers().map((server) => {
      const { id, host, port, authMode, username } = server;
      return { id, host, port, authMode, username };
    });

    return {
      servers,
      count: servers.length,
    };
  }
}
