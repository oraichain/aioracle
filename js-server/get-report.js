const db = require('./db');

const checkSubmit = async (req, res) => {
    let data = req.query;
    if (!data.request_id || !data.executor) return res.status(403).send({ code: 403 });
    try {
        const reportsStr = await db.get(data.request_id);
        const reports = JSON.parse(reportsStr);
        console.log("reports string: ", reports);
        const report = reports.filter(rep => rep.executor === data.executor);
        if (report.length > 0) return res.send({ code: 200, submitted: true })
        else return res.status(404).send({ submitted: false, code: 404 });
    } catch (error) {
        console.log("error in checking submit: ", error);
        return res.status(404).send({ code: 404, message: "Error getting report submission", error })
    }
}

module.exports = { checkSubmit };