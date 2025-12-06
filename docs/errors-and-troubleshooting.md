Troubleshooting Guide – GCD

Backend Issues:
- Prisma migration failures → ensure database file exists, check schema
- Nest cannot find a module → check file paths and exports
- Environment variable missing → ensure .env is loaded

Frontend Issues:
- Vite hot reload broken → clear node_modules, reinstall
- Type errors → ensure TS configs match project standards

Deployment Issues:
- SSH connection fails → verify host, user, port, permissions
- SFTP file write fails → check directory permissions on server

Schema Issues:
- UI fails to render → invalid field type or missing required keys
- Config fails to load → transformer mismatch with original format

General:
- Node version mismatch → use `.nvmrc`
- Unexpected behavior → check the Breaking Changes log
