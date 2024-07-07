export default function successResponse(res, code, message, data) {
    return res.status(200).json({
        status: true,
        code: code || 200,
        message: message || "Operation Success",
        data: data || null,
    });
}
