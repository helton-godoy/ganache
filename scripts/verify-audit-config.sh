#!/bin/bash
# verify-audit-config.sh
# Verifies that pam_tty_audit.so is correctly configured in PAM stack

set -e

echo "🔍 Verifying SSH Audit Configuration..."

# 1. Check if pam_tty_audit.so exists
if [ -f /lib/x86_64-linux-gnu/security/pam_tty_audit.so ] || [ -f /lib/security/pam_tty_audit.so ]; then
    echo "✅ pam_tty_audit.so module found"
else
    echo "❌ pam_tty_audit.so NOT found. Install libpam-modules."
    exit 1
fi

# 2. Check /etc/pam.d/sshd or common-session
FOUND_CONFIG=false

if grep -q "pam_tty_audit.so" /etc/pam.d/sshd; then
    echo "✅ pam_tty_audit enabled in /etc/pam.d/sshd"
    FOUND_CONFIG=true
fi

if grep -q "pam_tty_audit.so" /etc/pam.d/common-session; then
    echo "✅ pam_tty_audit enabled in /etc/pam.d/common-session"
    FOUND_CONFIG=true
fi

if [ "$FOUND_CONFIG" = false ]; then
    echo "❌ pam_tty_audit NOT enabled in PAM configuration"
    exit 1
fi

# 3. Check for specific configuration parameters (enable=*, log_passwd)
CONFIG_LINE=$(grep "pam_tty_audit.so" /etc/pam.d/common-session /etc/pam.d/sshd | head -n 1)
echo "ℹ️  Config line: $CONFIG_LINE"

if [[ "$CONFIG_LINE" == *"enable=*" ]]; then
    echo "✅ Logging enabled for specific patterns"
else
    echo "⚠️  Warning: 'enable=*' not explicitly set (might rely on defaults)"
fi

echo "✅ Audit Configuration Verified Successfully"
exit 0
