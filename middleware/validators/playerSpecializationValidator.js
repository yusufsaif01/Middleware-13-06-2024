const Joi = require('@hapi/joi');
const errors = require("../../errors");
const responseHandler = require("../../ResponseHandler");

class PlayerSpecializationValidator {
    async AbilityAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async addParameterAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required(),
            "ability_id": Joi.string().required()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async editParameterAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async PositionAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required(),
            "abbreviation": Joi.string().required(),
            "abilities": Joi.array()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
}

module.exports = new PlayerSpecializationValidator();