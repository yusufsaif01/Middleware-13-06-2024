const Joi = require('@hapi/joi');
const errors = require("../../errors");
const responseHandler = require("../../ResponseHandler");

class LocationValidator {
    async addStateAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required().regex(/^[a-zA-Z0-9\&\- ]+$/).error(() => {
                return {
                    message: 'Invalid name',
                };
            }),
            "country_id": Joi.string().required()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async editStateAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required().regex(/^[a-zA-Z0-9\&\- ]+$/).error(() => {
                return {
                    message: 'Invalid name',
                };
            })
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async addCityAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required().regex(/^[a-zA-Z0-9\&\- ]+$/).error(() => {
                return {
                    message: 'Invalid name',
                };
            }),
            "country_id": Joi.string().required(),
            "state_id": Joi.string().required()
        });
        try {
            await Joi.validate(req.body, schema);
            return next();
        } catch (err) {
            console.log(err.details);
            return responseHandler(req, res, Promise.reject(new errors.ValidationFailed(err.details[0].message)));
        }
    }
    async editCityAPIValidation(req, res, next) {
        const schema = Joi.object().keys({
            "name": Joi.string().required().regex(/^[a-zA-Z0-9\&\- ]+$/).error(() => {
                return {
                    message: 'Invalid name',
                };
            })
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

module.exports = new LocationValidator();