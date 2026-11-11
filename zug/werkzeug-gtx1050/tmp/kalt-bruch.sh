#!/bin/bash
# die Kalt-Zeile an der echten Karte, gesund und mit gepflanztem Bruch: kalt-bruch.sh <werkzeug>
cd /c/AnazhRealm || exit 1
node scripts/diag-boot-stage.cjs --kalt --echt > "$1/tmp/kalt-gesund.aus" 2>&1; echo "gesund EXIT=$?"
node scripts/diag-boot-stage.cjs --kalt --echt --mutante bruch > "$1/tmp/kalt-mutante.aus" 2>&1; echo "mutante EXIT=$?"
