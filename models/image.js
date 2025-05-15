import pool from '../lib/db.js'

export async function getAllImages() {
    try {

        const result = await pool.query(
            "SELECT key FROM access_log"
        )
        console.log({result})

        return {
            status: 'success',
            count: result.rowCount,
            images: result.rows
        }
    }catch (error) {
        return {
            status: 'error'
        }
    }
}

export async function saveImageToDB(fileName) {
    try {
        await pool.query(
            "INSERT INTO access_log (key) VALUES ($1)",
            [fileName]
        );
        return { status: "success",message: "success" }
    } catch (dbError) {
        console.error("Database logging error:", dbError);
        return {
            status:"error",
            message: "File upload failed",
            error: dbError.message
        };
    }
}

export async function deleteImageFromDB(fileName) {
    try {
        let deletedRow  = 0;
        const result = await pool.query("DELETE FROM access_log WHERE" +
            " key =($1)", [fileName]);
        deletedRow = result.rowCount;
        return {
            status: "success"
        }
    } catch (e) {
        return {
            status: "failed"
        }
    }
}