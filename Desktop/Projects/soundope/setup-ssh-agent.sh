#!/bin/bash
# Run this ONCE to add your SSH key to the agent
# Then the other scripts can use SSH without prompting

eval "$(ssh-agent -s)"
ssh-add /Users/josiahknoedler/Desktop/Projects/id_ed25519

echo "✅ SSH key added to agent"
echo "You can now run fix-server-auto.sh without entering passphrase again"

