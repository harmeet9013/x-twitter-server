export default function errorResponse(res, code, message, data) {
    return res.status(200).json({
        status: false,
        code: code || 404,
        message: message || "Unexpected Error",
        data: data || null,
    });
}
