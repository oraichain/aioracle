const { validationResult } = require('express-validator');
const { bech32 } = require('bech32');

// parallel processing
const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

const isOraiAddress = (value) => {
    try {
        const result = bech32.decode(value, 43);
        if (result.prefix === 'orai') return true;
        throw "invalid prefix"
    } catch (error) {
        throw error
    }
}

const isNotEmpty = (value) => {
    try {
        if (!value) return true;
        if (isNaN(value)) throw "Value must be a number or left empty";
        return true;
    } catch (error) {
        throw error
    }
}

const isValidRewards = (rewards) => {
    try {
        for (let reward of rewards) {
            // first index is oraiaddr, must be correct
            isOraiAddress(reward[0]);
            // 2nd index is denom of reward. Force it to be orai for now.
            if (reward[1] !== "orai") throw "invalid reward denom";
            // 3rd index is amount of reward. must be a number
            if (isNaN(reward[2])) throw "invalid reward amount";
        }
        return true;
    } catch (error) {
        throw error
    }
}

module.exports = { validate, isOraiAddress, isValidRewards, isNotEmpty };