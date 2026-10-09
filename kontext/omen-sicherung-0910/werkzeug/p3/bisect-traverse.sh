#!/bin/bash
# bisect-Kriterium: der volle Playtest wirft den Seiten-Fehler „group.traverse is not a function"
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/integ-gegen
npm run playtest > /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/bisect-last.txt 2>&1
if grep -q "group.traverse is not a function" /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/bisect-last.txt; then exit 1; fi
if grep -q "Laufzeit:" /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/bisect-last.txt; then exit 0; fi
exit 125
