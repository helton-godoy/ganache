# GANACHE - Deployment Guide

**Generated:** 2025-12-13
**Version:** 1.0.0
**Project:** GANACHE Enterprise NAS
**Classification:** web+backend
**Status:** Production Ready

---

## Environment Requirements

### System Requirements

#### Minimum Requirements
- **Operating System**: Debian 12 (Bullseye)
- **Architecture**: x86_64
- **CPU**: 4 cores (2.4 GHz minimum)
- **Memory**: 8GB RAM
- **Storage**: 100GB system disk + additional for volumes
- **Network**: 1Gbps for management, 10Gbps for replication

#### Recommended Requirements
- **Operating System**: Debian 12 (Bullseye)
- **Architecture**: x86_64
- **CPU**: 8 cores (3.0 GHz)
- **Memory**: 16GB RAM
- **Storage**: 500GB NVMe SSD system disk
- **Network**: 10Gbps for storage replication

### Hardware Compatibility

#### Legacy Hardware Support (LegacyHA Driver)
- **RAID Controllers**: Adaptec, LSI, Broadcom
- **Network Cards**: Intel, Broadcom, Mellanox
- **Storage**: SAS/SATA disks in RAID configuration
- **Cluster**: DRBD 9 compatible hardware

#### Modern Hardware Support (NativeZFS Driver)
- **Storage**: Direct-attached ZFS compatible disks
- **Network**: 10Gbps+ Ethernet
- **NVMe**: High-performance NVMe SSDs
- **No RAID**: ZFS handles redundancy natively

## Installation Methods

### Method 1: DEB Package Installation

#### Download and Install
```bash
# Download the latest DEB package
wget https://releases.ganache.example.com/ganache_1.0.0_amd64.deb

# Install the package
sudo dpkg -i ganache_1.0.0_amd64.deb

# Install dependencies
sudo apt-get install -f

# Enable and start the service
sudo systemctl enable ganache-server
sudo systemctl start ganache-server
```

#### Verify Installation
```bash
# Check service status
sudo systemctl status ganache-server

# Verify API is running
curl http://localhost:8080/api/system/health

# Check logs
sudo journalctl -u ganache-server -f
```

### Method 2: ISO Installation (Appliance Mode)

#### Boot from ISO
1. Download `ganache-appliance-1.0.0.iso`
2. Boot target machine from ISO
3. Follow installer prompts
4. System will be configured automatically

#### Post-Installation Setup
```bash
# Access web interface
# Navigate to: https://<server-ip>:8443

# Initial admin setup
# Create admin user and password
# Configure basic network settings
```

### Method 3: Docker Installation

#### Development Environment
```bash
# Pull Docker image
docker pull ganache/enterprise:1.0.0

# Run container
docker run -d \
  --name ganache-server \
  -p 8080:8080 \
  -p 8443:8443 \
  -v ganache-data:/var/lib/ganache \
  -v ganache-config:/etc/ganache \
  ganache/enterprise:1.0.0
```

#### Production Environment
```bash
# Create data directories
sudo mkdir -p /opt/ganache/{data,config,logs}
sudo chown -R ganache:ganache /opt/ganache

# Run with persistent storage
docker run -d \
  --name ganache-server \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 8443:8443 \
  -v /opt/ganache/data:/var/lib/ganache \
  -v /opt/ganache/config:/etc/ganache \
  -v /opt/ganache/logs:/var/log/ganache \
  ganache/enterprise:1.0.0
```

## Configuration Variables

### Environment Configuration

#### `/etc/ganache/ganache.conf`
```ini
# Network Configuration
LISTEN_ADDRESS=0.0.0.0
API_PORT=8080
HTTPS_PORT=8443
SSL_CERT_PATH=/etc/ssl/certs/ganache.crt
SSL_KEY_PATH=/etc/ssl/private/ganache.key

# Storage Configuration
STORAGE_DRIVER=legacy_ha
ZFS_POOL_NAME=tank
DRBD_RESOURCE_NAME=ganache

# Database Configuration
DATABASE_URL=postgresql://ganache:password@localhost:5432/ganache
DATABASE_POOL_SIZE=10

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/var/log/ganache/server.log

# Security Configuration
JWT_SECRET_KEY=your-secret-key-here
SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5

# Backup Configuration
BACKUP_LOCATION=/var/backups/ganache
BACKUP_RETENTION_DAYS=30
AUTO_BACKUP_INTERVAL=86400

# Monitoring Configuration
METRICS_ENABLED=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30
```

#### `/etc/ganache/storage.conf`
```ini
# Legacy HA Configuration
DRBD_PORT=7789
DRBD_PROXY_ENABLED=false
PACEMAKER_CLUSTER_NAME=ganache-cluster

# ZFS Configuration
ZFS_AUTO_SNAPSHOT_ENABLED=true
ZFS_COMPRESSION=on
ZFS_DEDUP=on

# Network Configuration
STORAGE_NETWORK_VLAN=100
REPLICATION_BANDWIDTH_LIMIT=1Gbps

# Volume Defaults
DEFAULT_VOLUME_SIZE=1TB
DEFAULT_FILESYSTEM=ext4
MAX_VOLUMES_PER_CLUSTER=1000
```

### SSL Certificate Setup

#### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/ganache.key \
  -out /etc/ssl/certs/ganache.crt \
  -subj "/C=BR/ST=State/L=City/O=Organization/CN=ganache-server"

# Set proper permissions
sudo chmod 600 /etc/ssl/private/ganache.key
sudo chmod 644 /etc/ssl/certs/ganache.crt
sudo chown root:ganache /etc/ssl/private/ganache.key
```

#### Let's Encrypt Certificate (Production)
```bash
# Install Certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d ganache.example.com

# Configure renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet

# Update paths in ganache.conf
SSL_CERT_PATH=/etc/letsencrypt/live/ganache.example.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/ganache.example.com/privkey.pem
```

## Database Setup

### PostgreSQL Installation
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE ganache;
CREATE USER ganache WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE ganache TO ganache;
\q

# Configure PostgreSQL for connection
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: local   ganache   ganache   md5
# Add: host    ganache   ganache   127.0.0.1/32   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Migration
```bash
# Run database migrations
sudo -u ganache ganache-migrate --config /etc/ganache/ganache.conf

sudo# Verify migration
 -u postgres psql -d ganache -c "\dt"
```

## Systemd Service Configuration

### Service File: `/etc/systemd/system/ganache-server.service`
```ini
[Unit]
Description=Ganache Enterprise NAS Server
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=ganache
Group=ganache
WorkingDirectory=/opt/ganache
ExecStart=/usr/local/bin/ganache-server --config /etc/ganache/ganache.conf
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ganache-server

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/opt/ganache /var/lib/ganache /var/log/ganache

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service
```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable ganache-server

# Start service
sudo systemctl start ganache-server

# Check status
sudo systemctl status ganache-server
```

## Storage Configuration

### Legacy HA Setup (DRBD + Pacemaker)

#### Install DRBD
```bash
# Add DRBD repository
echo "deb http://ftp.debian.org/debian bullseye-backports main" | sudo tee -a /etc/apt/sources.list

# Install DRBD 9
sudo apt-get update
sudo apt-get install -t bullseye-backports drbd-utils

# Load DRBD kernel module
sudo modprobe drbd
echo "drbd" | sudo tee -a /etc/modules-load.d/drbd.conf
```

#### Configure DRBD Resource
```bash
# Create DRBD configuration
sudo tee /etc/drbd.d/ganache.res << EOF
resource ganache {
    device /dev/drbd0;
    disk /dev/sdb1;
    meta-disk internal;
    on ganache-node1 {
        address 192.168.1.10:7789;
    }
    on ganache-node2 {
        address 192.168.1.11:7789;
    }
    net {
        protocol C;
        allow-two-primaries yes;
    }
}
EOF

# Initialize DRBD
sudo drbdadm create-md ganache
sudo drbdadm up ganache

# Primary node setup
sudo drbdadm primary ganache --force
sudo mkfs.ext4 /dev/drbd0
sudo mount /dev/drbd0 /mnt/ganache-data
```

#### Configure Pacemaker
```bash
# Install Pacemaker
sudo apt-get install pacemaker pcs

# Create cluster
sudo pcs cluster auth ganache-node1 ganache-node2
sudo pcs cluster setup --name ganache-cluster ganache-node1 ganache-node2

# Configure resources
sudo pcs resource create ganache-data Filesystem \
  device=/dev/drbd0 directory=/mnt/ganache-data fstype=ext4 \
  op start timeout=30s op stop timeout=30s

sudo pcs resource create ganache-server systemd:ganache-server \
  op start timeout=60s op stop timeout=60s

# Configure colocation
sudo pcs constraint colocation add ganache-server ganache-data INFINITY

# Start cluster
sudo pcs cluster start --all
```

### Native ZFS Setup

#### Install ZFS
```bash
# Install ZFS
sudo apt-get install zfsutils-linux zfs-zed

# Create ZFS pool
sudo zpool create tank /dev/sdb1
sudo zfs set compression=on tank
sudo zfs set atime=off tank
```

#### Configure ZFS Services
```bash
# Create ZFS dataset for Ganache
sudo zfs create -o mountpoint=/var/lib/ganache tank/ganache

# Set permissions
sudo chown -R ganache:ganache /var/lib/ganache

# Configure auto-snapshot
sudo zfs set snapdir=visible tank
sudo zfs set auto-snapshot=true tank
```

## Network Configuration

### Firewall Rules

#### UFW Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (adjust port as needed)
sudo ufw allow 22/tcp

# Allow Ganache API
sudo ufw allow 8080/tcp

# Allow HTTPS
sudo ufw allow 8443/tcp

# Allow monitoring (if enabled)
sudo ufw allow 9090/tcp

# Allow cluster communication (if using HA)
sudo ufw allow from 192.168.1.0/24 to any port 7789
```

#### iptables Rules
```bash
# Save current rules
sudo iptables-save > /etc/iptables/rules.v4

# Add Ganache rules
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 9090 -j ACCEPT

# Save updated rules
sudo iptables-save > /etc/iptables/rules.v4
```

### VLAN Configuration
```bash
# Create VLAN interface
sudo ip link add link eth0 name eth0.100 type vlan id 100

# Configure VLAN IP
sudo ip addr add 192.168.100.10/24 dev eth0.100
sudo ip link set eth0.100 up

# Make persistent
sudo tee -a /etc/network/interfaces.d/vlan100 << EOF

# VLAN 100 for storage network
auto eth0.100
iface eth0.100 inet static
address 192.168.100.10
netmask 255.255.255.0
vlan-raw-device eth0
EOF
```

## Backup Procedures

### Automated Backup Configuration
```bash
# Create backup directory
sudo mkdir -p /var/backups/ganache
sudo chown ganache:ganache /var/backups/ganache

# Configure backup script
sudo tee /opt/ganache/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ganache"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ganache_backup_$DATE.tar.gz"

# Create database backup
pg_dump ganache > /tmp/ganache_db_$DATE.sql

# Create configuration backup
tar -czf "$BACKUP_FILE" /etc/ganache/ /tmp/ganache_db_$DATE.sql

# Clean up temporary file
rm /tmp/ganache_db_$DATE.sql

# Remove old backups (keep last 30 days)
find "$BACKUP_DIR" -name "ganache_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

# Make executable
sudo chmod +x /opt/ganache/scripts/backup.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /opt/ganache/scripts/backup.sh >> /var/log/ganache/backup.log 2>&1
```

### Manual Backup
```bash
# Create immediate backup
sudo -u ganache /opt/ganache/scripts/backup.sh

# Verify backup
ls -la /var/backups/ganache/
```

### Restore Procedure
```bash
# Stop service
sudo systemctl stop ganache-server

# Restore configuration
sudo tar -xzf /var/backups/ganache/ganache_backup_YYYYMMDD_HHMMSS.tar.gz -C /

# Restore database
sudo -u postgres createdb ganache_restore
sudo -u postgres psql ganache_restore < /tmp/ganache_db_YYYYMMDD_HHMMSS.sql

# Update configuration
sudo nano /etc/ganache/ganache.conf
# Update DATABASE_URL if needed

# Start service
sudo systemctl start ganache-server

# Verify restore
curl http://localhost:8080/api/system/health
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
sudo journalctl -u ganache-server -n 50

# Check configuration
sudo ganache-server --config-test /etc/ganache/ganache.conf

# Check permissions
sudo chown -R ganache:ganache /opt/ganache
sudo chmod +x /usr/local/bin/ganache-server
```

#### Database Connection Issues
```bash
# Test database connection
sudo -u postgres psql -d ganache -c "SELECT version();"

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verify configuration
sudo nano /etc/ganache/ganache.conf
# Check DATABASE_URL format
```

#### Storage Issues
```bash
# Check DRBD status
sudo drbdadm status

# Check ZFS status
sudo zpool status tank

# Check volume mounting
df -h | grep -E "(drbd|zfs|tank)"

# Check cluster status (if using Pacemaker)
sudo pcs status
```

### Log Analysis

#### Application Logs
```bash
# Follow real-time logs
sudo journalctl -u ganache-server -f

# Search for errors
sudo journalctl -u ganache-server | grep -i error

# Filter by date
sudo journalctl --since "2025-12-13" --until "2025-12-14" -u ganache-server
```

#### System Logs
```bash
# Check system messages
sudo dmesg | grep -i ganache

# Check authentication logs
sudo tail -f /var/log/auth.log

# Check network logs
sudo tail -f /var/log/kern.log
```

### Performance Tuning

#### System Optimization
```bash
# Increase file descriptor limits
echo "ganache soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "ganache hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize network settings
echo "net.core.rmem_max = 16777216" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Database Optimization
```bash
# Optimize PostgreSQL
sudo tee -a /etc/postgresql/15/main/postgresql.conf << EOF
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

**Deployment guide prepared for production use**  
**Last Updated:** 2025-12-13  
**BMAD Compliance:** ✅ Complete  
**Ready for Production:** ✅ Yes