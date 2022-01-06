const db = require('./db');

const checkSubmit = async (req, res) => {
    let data = req.query;
    if (!data.request_id || !data.executor || !data.contract_addr) return res.status(403).send({ code: 403 });
    let key = `${data.contract_addr}${data.request_id}`;
    try {
        const reportsStr = await db.get(key);
        const reports = JSON.parse(reportsStr);
        const report = reports.filter(rep => rep.executor === Buffer.from(data.executor, 'hex').toString('base64')); // convert executor pubkey to hex to put in query string parameter. decode to base64
        if (report.length > 0) return res.send({ code: 200, submitted: true })
        else return res.status(404).send({ submitted: false, code: 404 });
    } catch (error) {
        console.log("error in checking submit: ", error);
        return res.status(404).send({ code: 404, message: "Error getting report submission", error })
    }
}

module.exports = { checkSubmit };