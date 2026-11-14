// Vorlade-Modul: der Richter nimmt cpus − 4 Fäden; hier 14 → 10 Fäden (der Laptop trägt heute andere Messungen).
const os = require('os'); const c = os.cpus(); os.cpus = () => c.slice(0, 14);
