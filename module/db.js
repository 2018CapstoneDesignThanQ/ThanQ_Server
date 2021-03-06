const pool = require('../config/db_pool');

module.exports = {
    queryParamNone: async (...args) => {
        const query = args[0];
        let result;
        let connection;
        try {
            connection = await pool.getConnection();
            result = await connection.query(query) || null;
        }
        catch (e) {
            console.log(e);
            next(e);
        }
        finally {
            pool.releaseConnection(connection);
            return result;
        }
    },

    queryParamArr: async (...args) => {
        const query = args[0];
        const value = args[1];
        let result;
        let connection;

        try {
            connection = await pool.getConnection();
            result = await connection.query(query, value) || null;

        } catch (e) {
            console.log(e);
            next(e);

        } finally {
            pool.releaseConnection(connection);
            return result;
        }
    },

    transactionControll : async (...args) => {
        // console.log("Transaction start")
        const connection = await pool.getConnection();

        // console.log("Transaction : beginTransaction")
        await connection.beginTransaction();

        // console.log("Transaction : result")
        const result = await args[0](connection, ...args).catch(async (err) => {
            // console.log("Transaction : rollback")
            await connection.rollback();
            // console.log("Transaction : releaseConnection")
            pool.releaseConnection(connection);
            throw err
        });

        // console.log("Transaction : commit")
        await connection.commit();

        // console.log("Transaction : releaseCOnnection")
        pool.releaseConnection(connection);

        // console.log("Transaction : return")
        return result
    }
}
