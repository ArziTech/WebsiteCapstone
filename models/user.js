import pool from "../lib/db.js";
import moment from "moment/moment.js";
import {cfGetSignedUrl} from "../utils/cloudfront.js";

export async function createNewUser(username, embed_matrix, imageLink) {
    try {
        await pool.query(
            "INSERT INTO users (name, embed, imageLink) VALUES ($1, $2, $3)",
            [username, embed_matrix, imageLink]
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

export async function getAllUser() {
    try {
        const dbResponse = await pool.query("SELECT * FROM users");

        const users =  dbResponse.rows.map((row) => {
            const name = row.name;
            try {
                const url = cfGetSignedUrl(row.imagelink)
                return {
                    name,
                    url,
                };
            } catch (s3Error) {
                console.error(`Error generating URL for ${name}:`, s3Error);
                return {
                    name,
                    error: 'Failed to generate URL',
                    exists: false
                };
            }
        })

        return {
            status: "success",
            users
        }
    } catch (dbError) {
        console.error("Database logging error:", dbError);
        return {
            status:"error",
            message: "Get user failed",
            error: dbError.message
        };
    }
}

export async function getSpecificUser(username) {
    try {
        const dbResponse = await pool.query("SELECT * FROM users WHERE name" +
            " =($1)", [username]);

        if(dbResponse.rows.length < 1) {
            return {
                status: 'success',
                message: 'user not found'
            }
        }

        const user =  dbResponse.rows[0]

        return {
            status: "success",
            user
        }
    } catch (dbError) {
        console.error("Database logging error:", dbError);
        return {
            status:"error",
            message: "Get user failed",
            error: dbError.message
        };
    }
}

export async function deleteUserFromDB(username) {
    try {
        let deletedRow  = 0;
        const result = await pool.query("DELETE FROM users WHERE" +
            " name =($1)", [username]);
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