const config = require('../config');
const AuthUtility = require('../db/utilities/AuthUtility');
const UserUtility = require('../db/utilities/UserUtility');
const PlayerUtility = require('../db/utilities/PlayerUtility')
const ClubAcademyUtility = require('../db/utilities/ClubAcademyUtility');
const errors = require("../errors");
const _ = require("lodash");
const MEMBER = require('../constants/MemberType');
const RESPONSE_MESSAGE = require('../constants/ResponseMessage');
const moment = require('moment');
const StorageProvider = require('storage-provider');
const STORAGE_PROVIDER_LOCAL = require('../constants/StorageProviderLocal');
const AADHAR_MEDIA_TYPE = require('../constants/AadharMediaType');
const DOCUMENT_MEDIA_TYPE = require('../constants/DocumentMediaType');
const DOCUMENT_TYPE = require('../constants/DocumentType');
const CountryUtility = require('../db/utilities/CountryUtility');
const StateUtility = require('../db/utilities/StateUtility');
const CityUtility = require('../db/utilities/CityUtility');
const PositionUtility = require('../db/utilities/PositionUtility');

/**
 *
 *
 * @class UserProfileService
 */
class UserProfileService {

    /**
     *Creates an instance of UserProfileService.
     * @memberof UserProfileService
     */
    constructor() {
        this.authUtilityInst = new AuthUtility();
        this.userUtilityInst = new UserUtility();
        this.playerUtilityInst = new PlayerUtility();
        this.clubAcademyUtilityInst = new ClubAcademyUtility();
        this.countryUtilityInst = new CountryUtility();
        this.stateUtilityInst = new StateUtility();
        this.cityUtilityInst = new CityUtility();
    }

    /**
     *
     *
     * 
     * @param {*} data
     * @returns
     * @memberof UserProfileService
     */

    async updateProfileDetails(requestedData = {}) {
        await this.updateProfileDetailsValidation(requestedData.updateValues, requestedData.member_type, requestedData.id);
        let profileData = await this.prepareProfileData(requestedData.member_type, requestedData.updateValues);
        if (requestedData.member_type == MEMBER.PLAYER) {
            let playerData = await this.prepareDocumentObj(profileData, requestedData.id);
            await this.playerUtilityInst.updateOne({ 'user_id': requestedData.id }, playerData);
        } else {
            await this.clubAcademyUtilityInst.updateOne({ 'user_id': requestedData.id }, profileData);
        }
    }
    async prepareDocumentObj(reqObj = {}, user_id) {
        if (!reqObj.documents)
            return Promise.resolve(reqObj)
        let details = await this.playerUtilityInst.findOne({ user_id: user_id }, { documents: 1 });
        if (details && details.documents && details.documents.length) {
            let documents = details.documents;
            let aadharDB = _.find(documents, { type: DOCUMENT_TYPE.AADHAR });
            let playerContractDB = _.find(documents, { type: DOCUMENT_TYPE.EMPLOYMENT_CONTRACT });
            let aadharReqObj = _.find(reqObj.documents, { type: DOCUMENT_TYPE.AADHAR })
            let playerContractReqObj = _.find(reqObj.documents, { type: DOCUMENT_TYPE.EMPLOYMENT_CONTRACT })
            if (aadharReqObj && !playerContractReqObj && playerContractDB) {
                reqObj.documents.push(playerContractDB)
            }
            if (playerContractReqObj && !aadharReqObj && aadharDB) {
                reqObj.documents.push(aadharDB)
            }
        }
        return Promise.resolve(reqObj)
    }

    async prepareProfileData(member_type, data) {
        if (data.dob) {
            data.dob = moment(data.dob).format("YYYY-MM-DD");
        }
        if (data.country && data.state && data.city) {
            let { country, state, city } = data;
            let foundCountry = await this.countryUtilityInst.findOne({ id: country }, { name: 1 });
            if (_.isEmpty(foundCountry)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.COUNTRY_NOT_FOUND));
            }
            let foundState = await this.stateUtilityInst.findOne({
                id: state,
                country_id: country,
            }, { name: 1 })
            if (_.isEmpty(foundState)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.STATE_NOT_FOUND));
            }
            let foundCity = await this.cityUtilityInst.findOne({
                id: city,
                state_id: state,
            }, { name: 1 })
            if (_.isEmpty(foundCity)) {
                return Promise.reject(new errors.NotFound(RESPONSE_MESSAGE.CITY_NOT_FOUND));
            }
            let countryObj = {
                id: country,
                name: foundCountry.name
            };
            let stateObj = {
                id: state,
                name: foundState.name
            };
            let cityObj = {
                id: city,
                name: foundCity.name
            };
            data.country = countryObj;
            data.state = stateObj;
            data.city = cityObj;
        }
        if (data.position) {
            let { position } = data;
            let msg = null;
            let positionArray = [];
            for (const element of position) {
                let positionObj = {};
                if (!element.id) {
                    msg = RESPONSE_MESSAGE.POSITION_ID_REQUIRED
                }
                if (element.id) {
                    let positionUtilityInst = new PositionUtility()
                    const foundPosition = await positionUtilityInst.findOne({ id: element.id }, { name: 1 });
                    if (_.isEmpty(foundPosition)) {
                        msg = RESPONSE_MESSAGE.POSITION_NOT_FOUND
                    }
                    else {
                        positionObj.name = foundPosition.name;
                        positionObj.id = element.id;
                    }
                }
                if (!element.priority) {
                    msg = RESPONSE_MESSAGE.POSITION_PRIORITY_REQUIRED
                }
                if (element.priority) {
                    positionObj.priority = element.priority;
                }
                positionArray.push(positionObj)
            };
            if (msg) {
                return Promise.reject(new errors.ValidationFailed(msg));
            }
            data.position = positionArray;
        }
        if (member_type == MEMBER.PLAYER) {
            if (data.aadhar_number) {
                let playerDocument = [];
                let documentReqObj = _.find(data.documents, { type: DOCUMENT_TYPE.AADHAR })
                if (documentReqObj) {
                    documentReqObj.document_number = data.aadhar_number
                    playerDocument.push(documentReqObj);
                }
                let employeContractDocument = _.find(data.documents, { type: DOCUMENT_TYPE.EMPLOYMENT_CONTRACT })
                if (employeContractDocument) {
                    playerDocument.push(employeContractDocument)
                }
                data.documents = playerDocument;
            }
            let institute = {
                "school": data.school ? data.school : null,
                "college": data.college ? data.college : null,
                "university": data.university ? data.university : null
            };
            let height = {
                "feet": data.height_feet ? data.height_feet : null,
                "inches": data.height_inches ? data.height_inches : null
            };

            let club_academy_details = {
                "head_coach_name": data.head_coach_name ? data.head_coach_name : "",
                "head_coach_phone": data.head_coach_phone ? data.head_coach_phone : "",
                "head_coach_email": data.head_coach_email ? data.head_coach_email : ""
            };

            if (!_.isEmpty(institute))
                data.institute = institute;

            if (!_.isEmpty(height))
                data.height = height;
            if (!_.isEmpty(club_academy_details))
                data.club_academy_details = club_academy_details;

        } else {
            let manager = {};
            let owner = {};
            let address = {};

            if (data.manager) {
                manager.name = data.manager
            }

            if (data.owner) {
                owner.name = data.owner
            }

            if (data.address) {
                address.full_address = data.address
            }

            if (data.pincode) {
                address.pincode = data.pincode
            }

            if (!_.isEmpty(address))
                data.address = address;

            if (!_.isEmpty(manager))
                data.manager = manager;

            if (!_.isEmpty(owner))
                data.owner = owner;

            if (data.documents) {
                if (member_type === MEMBER.ACADEMY && data.document_type && data.number) {
                    let documentReqObj = _.find(data.documents, { type: data.document_type })
                    if (documentReqObj) {
                        documentReqObj.document_number = data.number
                        data.documents = [documentReqObj]
                    }
                }
                if (member_type === MEMBER.CLUB && data.reg_number) {
                    let documentReqObj = _.find(data.documents, { type: DOCUMENT_TYPE.AIFF })
                    if (documentReqObj) {
                        documentReqObj.document_number = data.reg_number
                        data.documents = [documentReqObj]
                    }
                }
            }
        }
        return Promise.resolve(data)
    }

    async updateProfileBio(requestedData = {}) {
        let bioData = await this.prepareBioData(requestedData.updateValues);
        let res = {};
        if (requestedData.member_type == MEMBER.PLAYER) {
            await this.playerUtilityInst.updateOne({ 'user_id': requestedData.id }, bioData);
            if (bioData.avatar_url) {
                const { avatar_url } = await this.playerUtilityInst.findOne({ user_id: requestedData.id }, { avatar_url: 1 })
                res.avatar_url = avatar_url;
            }
        } else {
            await this.clubAcademyUtilityInst.updateOne({ 'user_id': requestedData.id }, bioData);
            if (bioData.avatar_url) {
                const { avatar_url } = await this.clubAcademyUtilityInst.findOne({ user_id: requestedData.id }, { avatar_url: 1 })
                res.avatar_url = avatar_url;
            }
        }
        return res;

    }

    prepareBioData(data) {
        let social_profiles = {};

        if (data.facebook)
            social_profiles.facebook = data.facebook;
        if (data.youtube)
            social_profiles.youtube = data.youtube;
        if (data.twitter)
            social_profiles.twitter = data.twitter;
        if (data.instagram)
            social_profiles.instagram = data.instagram;

        if (!_.isEmpty(social_profiles))
            data.social_profiles = social_profiles;

        return Promise.resolve(data)
    }

    async updateProfileDetailsValidation(data, member_type, user_id) {
        const { founded_in, trophies, documents } = data
        if (founded_in) {
            let msg = null;
            let d = new Date();
            let currentYear = d.getFullYear();

            if (founded_in > currentYear) {
                msg = RESPONSE_MESSAGE.FOUNDED_IN_GREATER_THAN_CURRENT_YEAR
            }
            if (founded_in < 0) {
                msg = RESPONSE_MESSAGE.FOUNDED_IN_CANNOT_BE_NEGATIVE
            }
            if (founded_in == 0) {
                msg = RESPONSE_MESSAGE.FOUNDED_IN_CANNOT_BE_ZERO
            }

            if (msg) {
                return Promise.reject(new errors.ValidationFailed(msg));
            }
        }
        if (trophies) {
            let msg = null;
            let d = new Date();
            let currentYear = d.getFullYear();
            trophies.forEach(element => {
                if (element.year > currentYear) {
                    msg = RESPONSE_MESSAGE.TROPHY_YEAR_GREATER_THAN_CURRENT_YEAR
                }
                if (element.year < 0) {
                    msg = RESPONSE_MESSAGE.TROPHY_YEAR_CANNOT_BE_NEGATIVE
                }
                if (element.year == 0) {
                    msg = RESPONSE_MESSAGE.TROPHY_YEAR_CANNOT_BE_ZERO
                }
            });
            if (msg) {
                return Promise.reject(new errors.ValidationFailed(msg));
            }
        }
        if (documents && member_type) {
            if (member_type === MEMBER.ACADEMY && !data.number) {
                return Promise.reject(new errors.ValidationFailed("PAN/ COI/ Tin Number is required"));
            }
            if (member_type === MEMBER.CLUB && !data.reg_number) {
                return Promise.reject(new errors.ValidationFailed("AIFF Registration Number is required"));
            }
            if (member_type !== MEMBER.PLAYER && (data.number || data.reg_number)) {
                let documentNum = data.number ? data.number : data.reg_number
                const details = await this.clubAcademyUtilityInst.findOne(
                    {
                        member_type: member_type, documents: {
                            $elemMatch: {
                                document_number: documentNum
                            }
                        }
                    }, { documents: 1, user_id: 1 });
                if (!_.isEmpty(details)) {
                    if (details.user_id !== user_id) {
                        if (member_type === MEMBER.CLUB)
                            return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.ID_DETAILS_EXISTS));
                        if (member_type === MEMBER.ACADEMY)
                            return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.DOCUMENT_DETAILS_EXISTS));
                    }
                }
            }
            if (member_type === MEMBER.PLAYER && data.aadhar_number && data.aadhar_media_type) {
                const details = await this.playerUtilityInst.findOne({
                    documents: {
                        $elemMatch: {
                            document_number: data.aadhar_number,
                            type: DOCUMENT_TYPE.AADHAR
                        }
                    }
                }, { documents: 1, user_id: 1 })
                if (!_.isEmpty(details)) {
                    if (details.user_id !== user_id)
                        return Promise.reject(new errors.Conflict(RESPONSE_MESSAGE.AADHAR_DETAILS_EXISTS));
                }
            }
        }
        return Promise.resolve()
    }

    getAttachmentType(fileName) {
        let attachment_type = DOCUMENT_MEDIA_TYPE.PDF;
        if (fileName) {
            let file_extension = fileName.split('.')[1] || null;
            if (file_extension && file_extension != DOCUMENT_MEDIA_TYPE.PDF) {
                attachment_type = DOCUMENT_MEDIA_TYPE.IMAGE;
            }
        }
        return attachment_type;
    }

    async uploadProfileDocuments(reqObj = {}, files = null) {
        try {
            if (files) {
                reqObj.documents = [];
                const configForLocal = config.storage;
                let options = STORAGE_PROVIDER_LOCAL.UPLOAD_OPTIONS;
                let storageProviderInst = new StorageProvider(configForLocal);
                if (reqObj.aadhar_media_type) {
                    if (!files.player_photo) {
                        return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.PLAYER_PHOTO_REQUIRED));
                    }
                    let user_photo = "";
                    if (files.player_photo) {
                        options.allowed_extensions = AADHAR_MEDIA_TYPE.ALLOWED_IMAGE_EXTENSIONS;
                        let uploadResponse = await storageProviderInst.uploadDocument(files.player_photo, options);
                        user_photo = uploadResponse.url
                    }
                    if (reqObj.aadhar_media_type === AADHAR_MEDIA_TYPE.PDF) {
                        if (!files.aadhar) {
                            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.AADHAR_REQUIRED));
                        }
                        if (files.aadhar) {
                            options.allowed_extensions = AADHAR_MEDIA_TYPE.PDF_EXTENSION;
                            let uploadResponse = await storageProviderInst.uploadDocument(files.aadhar, options);
                            reqObj.documents.push({
                                type: DOCUMENT_TYPE.AADHAR,
                                added_on: Date.now(), media: { attachment_type: AADHAR_MEDIA_TYPE.PDF, user_photo: user_photo, document: uploadResponse.url }
                            });
                        }
                    }
                    if (reqObj.aadhar_media_type === AADHAR_MEDIA_TYPE.IMAGE) {
                        if (!files.aadhar_front) {
                            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.AADHAR_FRONT_REQUIRED));
                        }
                        if (!files.aadhar_back) {
                            return Promise.reject(new errors.ValidationFailed(RESPONSE_MESSAGE.AADHAR_BACK_REQUIRED));
                        }
                        options.allowed_extensions = AADHAR_MEDIA_TYPE.ALLOWED_IMAGE_EXTENSIONS;
                        let doc_front = "", doc_back = "";
                        if (files.aadhar_front) {
                            let uploadResponse = await storageProviderInst.uploadDocument(files.aadhar_front, options);
                            doc_front = uploadResponse.url;
                        }
                        if (files.aadhar_back) {
                            let uploadResponse = await storageProviderInst.uploadDocument(files.aadhar_back, options);
                            doc_back = uploadResponse.url;
                        }
                        reqObj.documents.push({
                            type: DOCUMENT_TYPE.AADHAR,
                            added_on: Date.now(), media: { attachment_type: AADHAR_MEDIA_TYPE.IMAGE, user_photo: user_photo, doc_front: doc_front, doc_back: doc_back }
                        });
                    }
                }
                if (files.aiff) {
                    options.allowed_extensions = DOCUMENT_MEDIA_TYPE.ALLOWED_MEDIA_EXTENSIONS;
                    let uploadResponse = await storageProviderInst.uploadDocument(files.aiff, options);
                    let attachment_type = this.getAttachmentType(files.aiff.name);
                    reqObj.documents.push({
                        type: DOCUMENT_TYPE.AIFF,
                        added_on: Date.now(), media: { attachment_type: attachment_type, document: uploadResponse.url }
                    });
                }
                if (files.employment_contract) {
                    options.allowed_extensions = DOCUMENT_MEDIA_TYPE.ALLOWED_MEDIA_EXTENSIONS;
                    let uploadResponse = await storageProviderInst.uploadDocument(files.employment_contract, options);
                    let attachment_type = this.getAttachmentType(files.employment_contract.name);
                    reqObj.documents.push({
                        type: DOCUMENT_TYPE.EMPLOYMENT_CONTRACT,
                        added_on: Date.now(), media: { attachment_type: attachment_type, document: uploadResponse.url }
                    });
                }
                if (reqObj.document_type && files.document) {
                    options.allowed_extensions = DOCUMENT_MEDIA_TYPE.ALLOWED_MEDIA_EXTENSIONS;
                    let uploadResponse = await storageProviderInst.uploadDocument(files.document, options);
                    reqObj.documents.push({ link: uploadResponse.url, type: reqObj.document_type });
                    let attachment_type = this.getAttachmentType(files.document.name);
                    reqObj.documents.push({
                        type: reqObj.document_type,
                        added_on: Date.now(), media: { attachment_type: attachment_type, document: uploadResponse.url }
                    });
                }
            }

            if (reqObj.contact_person) {
                try {
                    reqObj.contact_person = JSON.parse(reqObj.contact_person);
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_CONTACT_PERSONS);
                }
            }
            if (reqObj.trophies) {
                try {
                    let trophies = JSON.parse(reqObj.trophies);
                    reqObj.trophies = trophies;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_TROPHIES);
                }
            }

            if (reqObj.position) {
                try {
                    let position = JSON.parse(reqObj.position);
                    reqObj.position = position;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_POSITION);
                }
            }

            if (reqObj.top_players) {
                try {
                    let top_players = JSON.parse(reqObj.top_players);
                    reqObj.top_players = top_players;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_TOP_PLAYERS);
                }
            }

            if (reqObj.owner) {
                try {
                    let owner = JSON.parse(reqObj.owner);
                    reqObj.owner = owner;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_OWNER);
                }
            }

            if (reqObj.manager) {
                try {
                    let manager = JSON.parse(reqObj.manager);
                    reqObj.manager = manager;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_MANAGER);
                }
            }

            if (reqObj.top_signings) {
                try {
                    let top_signings = JSON.parse(reqObj.top_signings);
                    reqObj.top_signings = top_signings;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed(RESPONSE_MESSAGE.INVALID_VALUE_TOP_SIGNINGS);
                }
            }
            return reqObj;
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     *
     * @param {*} 
     * @returns
     * @memberof UserRegistrationService
     */
    toAPIResponse({
        nationality, top_players, first_name, last_name, height, weight, dob,
        institute, documents, about, bio, position, strong_foot, weak_foot, former_club,
        former_academy, specialization, player_type, email, name, avatar_url, state,
        country, city, phone, founded_in, address, stadium_name, owner, manager, short_name,
        contact_person, trophies, club_academy_details, top_signings, associated_players, registration_number,
        member_type, social_profiles, type, league, league_other, association, association_other
    }) {
        return {
            nationality, top_players, first_name, last_name, height, weight, dob,
            institute, documents, about, bio, position, strong_foot, weak_foot, former_club,
            former_academy, specialization, player_type, email, name, avatar_url, state,
            country, city, phone, founded_in, address, stadium_name, owner, manager, short_name,
            contact_person, trophies, club_academy_details, top_signings, associated_players, registration_number,
            member_type, social_profiles, type, league, league_other, association, association_other
        };
    }
}

module.exports = UserProfileService;
