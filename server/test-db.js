const { sequelize } = require('./src/models');

console.log('Testing DB Sync...');
sequelize.sync({ alter: true })
    .then(() => {
        console.log('DB Sync SUCCESS!');
        process.exit(0);
    })
    .catch(err => {
        console.error('DB Sync FAILED:', err);
        process.exit(1);
    });
