
module.exports = {
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    options: {
        trustServerCertificate: true,
        trustedconnection: true,
        instancename: 'SQLEXPRESS'
    }
};
