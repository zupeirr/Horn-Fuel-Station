const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Simple backup script for SQLite
const backupDir = path.join(__dirname, '../backups');
const dbFile = path.join(__dirname, '../database.sqlite'); // Assuming default SQLite

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

console.log(`Starting database backup: ${backupPath}`);

fs.copyFile(dbFile, backupPath, (err) => {
    if (err) {
        console.error('Backup failed:', err);
    } else {
        console.log('Backup successful!');
        
        // Retention: delete backups older than 7 days
        fs.readdir(backupDir, (err, files) => {
            if (err) return;
            const now = Date.now();
            files.forEach(file => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old backup: ${file}`);
                }
            });
        });
    }
});
