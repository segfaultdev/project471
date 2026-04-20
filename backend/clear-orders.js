const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Delete all orders
db.run('DELETE FROM orders', function(err) {
  if (err) {
    console.error('Error deleting orders:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log(`✅ Successfully deleted ${this.changes} order(s)`);
  
  // Verify deletion
  db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
    if (err) {
      console.error('Error verifying deletion:', err.message);
    } else {
      console.log(`📊 Remaining orders in database: ${row.count}`);
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});
