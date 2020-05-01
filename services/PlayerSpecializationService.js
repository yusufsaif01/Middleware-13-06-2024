const _ = require("lodash");
const errors = require("../errors");
const AbilityUtility = require('../db/utilities/AbilityUtility');
const ParameterUtility = require('../db/utilities/ParameterUtility');
const PositionUtility = require('../db/utilities/PositionUtility');
const AbilityListResponseMapper = require("../dataModels/responseMapper/AbilityListResponseMapper");
const ParameterListResponseMapper = require("../dataModels/responseMapper/ParameterListResponseMapper");
const PositionListResponseMapper = require("../dataModels/responseMapper/PositionListResponseMapper");
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');

class PlayerSpecializationService {

    constructor() {
        this.abilityUtilityInst = new AbilityUtility();
        this.parameterUtilityInst = new ParameterUtility();
        this.positionUtilityInst = new PositionUtility();
    }
    async addAbility(data = {}) {
        try {
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const ability = await this.abilityUtilityInst.findOne({ name: regex });
            if (!_.isEmpty(ability)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ABILITY_ALREADY_ADDED));
            }
            await this.abilityUtilityInst.insert({ name: reqObj.name })
            Promise.resolve()
        } catch (e) {
            console.log("Error in addAbility() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async getAbilityList() {
        try {
            let response = {}, totalRecords = 0;
            totalRecords = await this.abilityUtilityInst.countList({});
            let projection = { id: 1, name: 1 }
            let data = await this.abilityUtilityInst.find({}, projection);
            data = new AbilityListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getAbilityList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editAbility(data = {}) {
        try {
            let foundAbility = await this.abilityUtilityInst.findOne({ id: data.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const ability = await this.abilityUtilityInst.findOne({ name: regex });
            if (!_.isEmpty(ability)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ABILITY_ALREADY_ADDED));
            }
            await this.abilityUtilityInst.updateOne({ id: data.ability_id }, { name: reqObj.name })
            Promise.resolve()
        } catch (e) {
            console.log("Error in editAbility() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addParameter(data = {}) {
        try {
            let reqObj = data.reqObj;
            let foundAbility = await this.abilityUtilityInst.findOne({ id: reqObj.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const parameter = await this.parameterUtilityInst.findOne({ name: regex, ability_id: reqObj.ability_id });
            if (!_.isEmpty(parameter)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.PARAMETER_ALREADY_ADDED));
            }
            await this.parameterUtilityInst.insert({ name: reqObj.name, ability_id: reqObj.ability_id })
            Promise.resolve()
        } catch (e) {
            console.log("Error in addParameter() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async getParameterList(ability_id) {
        try {
            let response = {}, totalRecords = 0;
            let foundAbility = await this.abilityUtilityInst.findOne({ id: ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            totalRecords = await this.parameterUtilityInst.countList({ ability_id: ability_id });
            let projection = { id: 1, name: 1 }
            let data = await this.parameterUtilityInst.find({ ability_id: ability_id }, projection);
            data = new ParameterListResponseMapper().map(data);
            let abilityName = "";
            abilityName = foundAbility.name ? foundAbility.name : "";
            response = {
                ability: abilityName,
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getParameterList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editParameter(data = {}) {
        try {
            let foundAbility = await this.abilityUtilityInst.findOne({ id: data.ability_id });
            if (_.isEmpty(foundAbility)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.ABILITY_NOT_FOUND));
            }
            let foundParameter = await this.parameterUtilityInst.findOne({ id: data.parameter_id, ability_id: data.ability_id });
            if (_.isEmpty(foundParameter)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.PARAMETER_NOT_FOUND));
            }
            let reqObj = data.reqObj;
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            let regex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            const parameter = await this.parameterUtilityInst.findOne({ name: regex, ability_id: data.ability_id });
            if (!_.isEmpty(parameter)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.PARAMETER_ALREADY_ADDED));
            }
            await this.parameterUtilityInst.updateOne({ id: data.parameter_id }, { name: reqObj.name })
            Promise.resolve()
        } catch (e) {
            console.log("Error in editParameter() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addPositions(data = []) {
        try {
            await this.positionUtilityInst.insertMany(data)
        } catch (err) {
            return err;
        }
    }
    async addPosition(data = {}) {
        try {
            let reqObj = data.reqObj;
            await this.addPositionValidation(reqObj)
            let record = {
                name: reqObj.name,
                abbreviation: reqObj.abbreviation
            }
            if (reqObj.abilities && reqObj.abilities.length)
                record.abilities = reqObj.abilities;
            await this.positionUtilityInst.insert(record)
            Promise.resolve()
        } catch (e) {
            console.log("Error in addPosition() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async addPositionValidation(reqObj = {}) {
        try {
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            reqObj.abbreviation = reqObj.abbreviation.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            if (_.isEmpty(reqObj.abbreviation)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.ABBREVIATION_CANNOT_BE_EMPTY));
            }
            let nameRegex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            let abbreviationRegex = new RegExp(["^", reqObj.abbreviation, "$"].join(""), "i");
            let conditions = { $or: [{ name: nameRegex }, { abbreviation: abbreviationRegex }] }
            const position = await this.positionUtilityInst.findOne(conditions);
            if (!_.isEmpty(position)) {
                return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_ALREADY_ADDED));
            }
            return Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getPositionList() {
        try {
            let response = {}, totalRecords = 0;
            totalRecords = await this.positionUtilityInst.countList({});
            let data = await this.positionUtilityInst.aggregate([
                { $sort: { createdAt: -1 } },
                {
                    $lookup: { from: "abilities", localField: "abilities", foreignField: "id", as: "output" }
                },
                {
                    $project: {
                        id: 1, name: 1, abbreviation: 1,
                        abilities: { $map: { input: "$output", as: "ability", in: { id: "$$ability.id", name: "$$ability.name" } } }
                    }
                }])
            data = new PositionListResponseMapper().map(data);
            response = {
                total: totalRecords,
                records: data
            }
            return response;
        } catch (e) {
            console.log("Error in getPositionList() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editPosition(data = {}) {
        try {
            let reqObj = data.reqObj;
            await this.editPositionValidation(reqObj, data.position_id)
            let record = {
                name: reqObj.name,
                abbreviation: reqObj.abbreviation
            }
            if (reqObj.abilities)
                record.abilities = reqObj.abilities;
            await this.positionUtilityInst.updateOne({ id: data.position_id }, record)
            Promise.resolve()
        } catch (e) {
            console.log("Error in editPosition() of PlayerSpecializationService", e);
            return Promise.reject(e);
        }
    }
    async editPositionValidation(reqObj = {}, position_id) {
        try {
            const position = await this.positionUtilityInst.findOne({ id: position_id });
            if (_.isEmpty(position)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.POSITION_NOT_FOUND));
            }
            reqObj.name = reqObj.name.trim().replace(/\s\s+/g, ' ');
            reqObj.abbreviation = reqObj.abbreviation.trim().replace(/\s\s+/g, ' ');
            if (_.isEmpty(reqObj.name)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.NAME_CANNOT_BE_EMPTY));
            }
            if (_.isEmpty(reqObj.abbreviation)) {
                return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.ABBREVIATION_CANNOT_BE_EMPTY));
            }
            let nameRegex = new RegExp(["^", reqObj.name, "$"].join(""), "i");
            let abbreviationRegex = new RegExp(["^", reqObj.abbreviation, "$"].join(""), "i");
            const foundPosition = await this.positionUtilityInst.findOne({ name: nameRegex });
            if (!_.isEmpty(foundPosition)) {
                if (reqObj.name !== position.name)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_WITH_SAME_NAME_ALREADY_ADDED))
            }
            const foundAbbreviation = await this.positionUtilityInst.findOne({ abbreviation: abbreviationRegex });
            if (!_.isEmpty(foundAbbreviation)) {
                if (reqObj.abbreviation !== position.abbreviation)
                    return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.POSITION_WITH_SAME_ABBREVIATION_ALREADY_ADDED))
            }
            return Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
}

module.exports = PlayerSpecializationService;