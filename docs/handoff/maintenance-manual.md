# GANACHE - Maintenance Manual

**Generated:** 2025-12-13
**Version:** 1.0.0
**Project:** GANACHE Enterprise NAS
**Classification:** web+backend
**Status:** Operational Ready

---

## Monitoring Dashboards

### System Monitoring

#### Web Interface Access
- **URL**: `https://<server-ip>:8443`
- **Default Admin**: `admin` / `<setup-password>`
- **Dashboard Sections**:
  - System Overview
  - Volume Management
  - Storage Health
  - Performance Metrics
  - Backup Status
  - User Management

#### Health Check Endpoints
```bash
# System health
curl -k https://localhost:8443/api/system/health

# Detailed system info
curl -k https://localhost:8443/api/system/info

# Real-time metrics
curl -k https://localhost:8443/api/system/metrics
```

#### Prometheus Metrics
```bash
# Metrics endpoint (if enabled)
curl http://localhost:9090/metrics

# Example metrics:
# ganache_volumes_total
# ganache_volume_size_bytes
# ganache_api_requests_total
# ganache_api_request_duration_seconds
# ganache_system_cpu_usage_percent
# ganache_system_memory_usage_percent
```

### Log Analysis

#### Application Logs
```bash
# Real-time application logs
sudo journalctl -u ganache-server -f

# Error logs only
sudo journalctl -u ganache-server | grep -i error

# Logs from specific date
sudo journalctl --since "2025-12-13" --until "2025-12-14" -u ganache-server

# Log levels
sudo journalctl -u ganache-server -p err
sudo journalctl -u ganache-server -p warning
sudo journalctl -u ganache-server -p info
```

#### Log Locations
```
/var/log/ganache/
├── server.log          # Main application log
├── access.log          # HTTP access log
├── error.log           # Error-specific log
├── audit.log           # Security audit log
└── backup.log          # Backup operation log
```

#### Log Rotation Configuration
```bash
# /etc/logrotate.d/ganache
/var/log/ganache/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ganache ganache
    postrotate
        systemctl reload ganache-server
    endscript
}
```

## Update Procedures

### System Updates

#### OS Updates
```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Check for Ganache updates
apt list --upgradable | grep ganache

# Install Ganache updates
sudo apt-get install ganache

# Restart service after updates
sudo systemctl restart ganache-server
```

#### Manual Updates
```bash
# Download latest DEB package
wget https://releases.ganache.example.com/ganache_1.0.1_amd64.deb

# Install update
sudo dpkg -i ganache_1.0.1_amd64.deb

# Verify update
ganache-server --version
```

#### Update Rollback
```bash
# Rollback to previous version
sudo apt-get install ganache=1.0.0

# Or from DEB package
sudo dpkg -i ganache_1.0.0_amd64.deb

# Restart service
sudo systemctl restart ganache-server
```

### Configuration Updates

#### Safe Configuration Changes
```bash
# Backup current configuration
sudo cp /etc/ganache/ganache.conf /etc/ganache/ganache.conf.backup.$(date +%Y%m%d)

# Edit configuration
sudo nano /etc/ganache/ganache.conf

# Test configuration
sudo ganache-server --config-test /etc/ganache/ganache.conf

# Reload service (graceful restart)
sudo systemctl reload ganache-server

# If reload fails, restart
sudo systemctl restart ganache-server
```

#### Configuration Validation
```bash
# Validate configuration syntax
sudo ganache-server --validate-config /etc/ganache/ganache.conf

# Test database connectivity
sudo ganache-server --test-db /etc/ganache/ganache.conf

# Check SSL certificates
sudo ganache-server --check-ssl /etc/ganache/ganache.conf
```

## Scaling Guidelines

### Horizontal Scaling

#### Adding API Instances
```bash
# On additional servers
sudo apt-get install ganache

# Configure as slave/worker
sudo tee -a /etc/ganache/ganache.conf << EOF
# Master server configuration
MASTER_NODE=http://192.168.1.10:8080
WORKER_MODE=enabled
EOF

# Start as worker
sudo systemctl start ganache-server
```

#### Load Balancer Configuration (HAProxy)
```bash
# Install HAProxy
sudo apt-get install haproxy

# Configure load balancing
sudo tee /etc/haproxy/haproxy.cfg << EOF
frontend ganache_frontend
    bind *:8080
    default_backend ganache_backend

backend ganache_backend
    balance roundrobin
    server ganache1 192.168.1.10:8080 check
    server ganache2 192.168.1.11:8080 check
    server ganache3 192.168.1.12:8080 check
EOF

# Restart HAProxy
sudo systemctl restart haproxy
```

### Vertical Scaling

#### Memory Optimization
```bash
# Increase service memory limit
sudo systemctl edit ganache-server
# Add:
[Service]
MemoryLimit=4G

# Apply changes
sudo systemctl daemon-reload
sudo systemctl restart ganache-server
```

#### CPU Optimization
```bash
# Set CPU affinity
sudo systemctl edit ganache-server
# Add:
[Service]
CPUAffinity=0-7
TasksMax=4096

# Apply changes
sudo systemctl daemon-reload
sudo systemctl restart ganache-server
```

## Incident Response

### Common Issues and Solutions

#### Service Not Starting
```bash
# Check service status
sudo systemctl status ganache-server

# Check recent logs
sudo journalctl -u ganache-server -n 50

# Check configuration
sudo ganache-server --config-test /etc/ganache/ganache.conf

# Check permissions
ls -la /usr/local/bin/ganache-server
sudo chown root:root /usr/local/bin/ganache-server
sudo chmod 755 /usr/local/bin/ganache-server
```

#### Database Connection Issues
```bash
# Test database connectivity
sudo -u postgres psql -d ganache -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection string in config
grep DATABASE_URL /etc/ganache/ganache.conf
```

#### High CPU Usage
```bash
# Check process CPU usage
top -p $(pgrep ganache-server)

# Check for infinite loops
sudo strace -p $(pgrep ganache-server)

# Monitor system load
sar -u 1 10

# Restart service if needed
sudo systemctl restart ganache-server
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check for memory leaks
sudo systemctl status ganache-server
sudo journalctl -u ganache-server | grep -i "memory\|oom"

# Restart service
sudo systemctl restart ganache-server
```

### Runbooks

#### Volume Creation Failure
```bash
# 1. Check system resources
df -h
free -h

# 2. Check storage backend
sudo zpool status  # For ZFS
sudo drbdadm status  # For DRBD

# 3. Check volume configuration
curl -k https://localhost:8443/api/volumes | jq

# 4. Check logs for errors
sudo journalctl -u ganache-server | grep -i "volume\|create"

# 5. Retry operation
# If fails, check storage driver logs
sudo journalctl -u pacemaker  # For DRBD
sudo zpool events -v  # For ZFS
```

#### Backup Failure
```bash
# 1. Check backup service
sudo systemctl status ganache-backup

# 2. Check backup location
ls -la /var/backups/ganache/

# 3. Check database connectivity
sudo -u postgres psql -d ganache -c "SELECT count(*) FROM volumes;"

# 4. Check disk space
df -h /var/backups/

# 5. Manual backup test
sudo -u ganache /opt/ganache/scripts/backup.sh

# 6. Check backup logs
sudo tail -f /var/log/ganache/backup.log
```

#### Network Connectivity Issues
```bash
# 1. Check network interfaces
ip addr show

# 2. Test internal connectivity
ping -c 3 192.168.1.10

# 3. Check firewall rules
sudo ufw status numbered
sudo iptables -L

# 4. Check port availability
netstat -tlnp | grep :8080
netstat -tlnp | grep :8443

# 5. Test API endpoints
curl -k https://localhost:8443/api/system/health
```

### Escalation Procedures

#### Level 1: Operator Actions (0-15 minutes)
1. Check system health endpoints
2. Review recent logs for errors
3. Restart services if necessary
4. Verify backup completion status
5. Check user-reported issues

#### Level 2: System Administrator (15-60 minutes)
1. Analyze system performance metrics
2. Check storage backend health
3. Review configuration changes
4. Perform database maintenance
5. Coordinate with Level 3 if needed

#### Level 3: Senior Administrator (1-4 hours)
1. Deep dive into application logs
2. Analyze performance bottlenecks
3. Coordinate with development team
4. Plan emergency maintenance window
5. Document incident resolution

#### Emergency Contacts
- **Level 1**: On-call operator
- **Level 2**: System administrator
- **Level 3**: Senior administrator
- **Development**: development-team@company.com
- **Management**: manager@company.com

## Backup & Restore

### Backup Procedures

#### Automated Backups
```bash
# Verify backup cron job
sudo crontab -l | grep backup

# Check backup completion
sudo tail -f /var/log/ganache/backup.log

# List available backups
ls -la /var/backups/ganache/
```

#### Manual Backup
```bash
# Create immediate backup
sudo -u ganache /opt/ganache/scripts/backup.sh

# Verify backup integrity
tar -tzf /var/backups/ganache/ganache_backup_*.tar.gz

# Backup to remote location
rsync -avz /var/backups/ganache/ backup-server:/backups/ganache/
```

#### Backup Verification
```bash
# Test backup integrity
sudo -u ganache /opt/ganache/scripts/verify-backup.sh /var/backups/ganache/ganache_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore to test location
mkdir /tmp/test-restore
cd /tmp/test-restore
sudo tar -xzf /var/backups/ganache/ganache_backup_YYYYMMDD_HHMMSS.tar.gz
sudo chown -R ganache:ganache /tmp/test-restore
```

### Restore Procedures

#### Database Restore
```bash
# Stop service
sudo systemctl stop ganache-server

# Backup current database
sudo -u postgres pg_dump ganache > /tmp/ganache_current_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres dropdb ganache
sudo -u postgres createdb ganache
sudo -u postgres psql ganache < /tmp/ganache_db_YYYYMMDD_HHMMSS.sql

# Update configuration if needed
sudo nano /etc/ganache/ganache.conf

# Start service
sudo systemctl start ganache-server

# Verify restore
curl -k https://localhost:8443/api/system/health
```

#### Configuration Restore
```bash
# Stop service
sudo systemctl stop ganache-server

# Backup current configuration
sudo cp -r /etc/ganache /etc/ganache.backup.$(date +%Y%m%d)

# Restore configuration
sudo tar -xzf /var/backups/ganache/ganache_backup_YYYYMMDD_HHMMSS.tar.gz -C /

# Verify configuration
sudo ganache-server --config-test /etc/ganache/ganache.conf

# Start service
sudo systemctl start ganache-server
```

#### Complete System Restore
```bash
# 1. Stop all services
sudo systemctl stop ganache-server
sudo systemctl stop postgresql

# 2. Restore configuration
sudo tar -xzf /var/backups/ganache/ganache_backup_YYYYMMDD_HHMMSS.tar.gz -C /

# 3. Restore database
sudo -u postgres dropdb ganache
sudo -u postgres createdb ganache
sudo -u postgres psql ganache < /tmp/ganache_db_YYYYMMDD_HHMMSS.sql

# 4. Restore storage configuration
# (DRBD or ZFS restore procedures)

# 5. Start services
sudo systemctl start postgresql
sudo systemctl start ganache-server

# 6. Verify system
curl -k https://localhost:8443/api/system/health
```

## Security Updates

### Patch Management
```bash
# Check for security updates
sudo apt list --upgradable | grep -i security

# Install security updates
sudo apt-get update
sudo apt-get upgrade

# Check for Ganache security patches
apt list --upgradable | grep ganache

# Install security patches
sudo apt-get install ganache
```

### Security Audit
```bash
# Check SSL certificate validity
openssl x509 -in /etc/ssl/certs/ganache.crt -text -noout

# Check user permissions
ls -la /etc/ganache/
sudo chown root:ganache /etc/ganache/ganache.conf
sudo chmod 640 /etc/ganache/ganache.conf

# Review access logs
sudo tail -f /var/log/ganache/audit.log

# Check failed login attempts
sudo grep "authentication failure" /var/log/auth.log
```

### Vulnerability Scanning
```bash
# Install security scanner
sudo apt-get install lynis

# Run security audit
sudo lynis audit system

# Check for open ports
nmap -sS localhost

# Review firewall status
sudo ufw status verbose
```

## Performance Monitoring

### Key Metrics

#### System Metrics
```bash
# CPU usage
sar -u 1 5

# Memory usage
free -h
cat /proc/meminfo

# Disk I/O
iostat -x 1 5

# Network statistics
netstat -i
ss -tuln
```

#### Application Metrics
```bash
# API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/system/health

# Connection counts
netstat -an | grep :8080 | wc -l

# Process statistics
ps aux | grep ganache-server
```

#### Storage Metrics
```bash
# ZFS statistics
sudo zpool iostat tank 1 5

# DRBD statistics
sudo drbdadm status

# Volume statistics
curl -k https://localhost:8443/api/system/metrics | jq '.volumes'
```

### Performance Tuning

#### Database Optimization
```bash
# Analyze database performance
sudo -u postgres psql -d ganache -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"

# Update database statistics
sudo -u postgres psql -d ganache -c "ANALYZE;"

# Vacuum database
sudo -u postgres psql -d ganache -c "VACUUM ANALYZE;"
```

#### System Tuning
```bash
# Optimize kernel parameters
sudo tee -a /etc/sysctl.conf << EOF
# Network optimizations
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 262144 16777216
net.ipv4.tcp_wmem = 4096 262144 16777216
EOF

# Apply changes
sudo sysctl -p
```

## Capacity Planning

### Growth Monitoring
```bash
# Monitor volume count growth
curl -k https://localhost:8443/api/volumes | jq 'length'

# Monitor storage utilization
curl -k https://localhost:8443/api/system/metrics | jq '.storage.used_percent'

# Monitor user growth
sudo -u postgres psql -d ganache -c "
SELECT date_trunc('month', created_at) as month, count(*) 
FROM users 
GROUP BY month 
ORDER BY month;
"
```

### Resource Forecasting
```bash
# Calculate storage growth rate
# Monitor /var/backups/ directory size growth over time

# Monitor database growth
sudo -u postgres psql -d ganache -c "
SELECT pg_size_pretty(pg_database_size('ganache')) as db_size;
"

# Monitor log file growth
du -sh /var/log/ganache/
```

### Scaling Triggers
- **CPU Usage**: >80% for 15+ minutes
- **Memory Usage**: >85% for 10+ minutes
- **Disk Usage**: >90% for system, >80% for data
- **API Response Time**: >500ms average
- **Database Connections**: >80% of max_connections

---

**Maintenance manual prepared for operations team**  
**Last Updated:** 2025-12-13  
**BMAD Compliance:** ✅ Complete  
**Ready for Operations:** ✅ Yes