import {getAllUser as modelGetAllUser} from "../models/user.js";
import {getAllAccessLog} from "../models/access_log.js";


export function welcome(req, res) {
    return res.render('welcome.ejs')
}

export async function access (req, res)  {
    try {
        const response = await getAllAccessLog()

        return res.render('access.ejs', {
            ...response,
            count: response.count
        })
    } catch (error) {
        console.error("Error fetching image URLs:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to retrieve image URLs",
            error: error.message
        });
    }
}

export function dashboard(req, res) {
    return res.render('dashboard.ejs')
}

export function register(req, res) {
    return res.render('register.ejs')
}


export async function getAllUser(req, res) {
    const result = await modelGetAllUser()
    if(result.status === "error") {
        return res.status(500).json({
            message: `Error in controller ${result.message}`,
        });
    }

    return res.render('users.ejs', {
        ...result,
        count: result.users.length
    })
}