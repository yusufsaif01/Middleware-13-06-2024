const config = require('../config');
const AuthUtility = require('../db/utilities/AuthUtility');
const UserUtility = require('../db/utilities/UserUtility');
const PlayerUtility = require('../db/utilities/PlayerUtility')
const ClubAcademyUtility = require('../db/utilities/ClubAcademyUtility');
const FileService = require('../services/FileService');
const errors = require("../errors");
const _ = require("lodash");

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
        await this.updateProfileDetailsValidation(requestedData.updateValues);
        let profileData = await this.prepareProfileData(requestedData.member_type, requestedData.updateValues);

        if (requestedData.member_type == 'player') {
            await this.playerUtilityInst.updateOne({ 'user_id': requestedData.id }, profileData);
        } else {
            await this.clubAcademyUtilityInst.updateOne({ 'user_id': requestedData.id }, profileData);
        }
    }

    prepareProfileData(member_type, data) {
        if (member_type == 'player') {
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

            if (data.country) {
                address.country = data.country
            }

            if (data.city) {
                address.city = data.city
            }

            if (!_.isEmpty(address))
                data.address = address;

            if (!_.isEmpty(manager))
                data.manager = manager;

            if (!_.isEmpty(owner))
                data.owner = owner;
        }
        return Promise.resolve(data)
    }

    async updateProfileBio(requestedData = {}) {
        let bioData = await this.prepareBioData(requestedData.updateValues);
        console.log({ 'user_id': requestedData.id }, bioData, requestedData.member_type);
        if (requestedData.member_type == 'player') {
            let res = await this.playerUtilityInst.updateOne({ 'user_id': requestedData.id }, bioData);
            if (bioData.avatar_url) {
                const { avatar_url } = await this.playerUtilityInst.findOne({ user_id: requestedData.id }, { avatar_url: 1 })
                res.avatar_url = avatar_url;
            }
            return res;
        } else {
            let res = await this.clubAcademyUtilityInst.updateOne({ 'user_id': requestedData.id }, bioData);
            if (bioData.avatar_url) {
                const { avatar_url } = await this.clubAcademyUtilityInst.findOne({ user_id: requestedData.id }, { avatar_url: 1 })
                res.avatar_url = avatar_url;
            }
            return res;
        }
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

    updateProfileDetailsValidation(data) {
        const { founded_in, trophies } = data
        if (founded_in) {
            let msg = null;
            let d = new Date();
            let currentYear = d.getFullYear();

            if (founded_in > currentYear) {
                msg = "founded_in is greater than " + currentYear
            }
            if (founded_in < 0) {
                msg = "founded_in cannot be negative"
            }
            if (founded_in == 0) {
                msg = "founded_in cannot be zero"
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
                    msg = "trophy year is greater than " + currentYear
                }
                if (element.year < 0) {
                    msg = "trophy year cannot be negative"
                }
                if (element.year == 0) {
                    msg = "trophy year cannot be zero"
                }
            });
            if (msg) {
                return Promise.reject(new errors.ValidationFailed(msg));
            }
        }
        return Promise.resolve()
    }

    async uploadProfileDocuments(reqObj = {}, files = null) {
        try {
            if (files) {
                reqObj.documents = [];
                const _fileInst = new FileService();
                if (files.aadhar) {
                    let file_url = await _fileInst.uploadFile(files.aadhar, "./documents/", files.aadhar.name);
                    reqObj.documents.push({ link: file_url, type: 'aadhar' });
                }
                if (files.aiff) {
                    let file_url = await _fileInst.uploadFile(files.aiff, "./documents/", files.aiff.name);
                    reqObj.documents.push({ link: file_url, type: 'aiff' });
                }
                if (files.employment_contract) {
                    let file_url = await _fileInst.uploadFile(files.employment_contract, "./documents/", files.employment_contract.name);
                    reqObj.documents.push({ link: file_url, type: 'employment_contract' });
                }
                if (reqObj.document_type && files.document) {
                    let file_url = await _fileInst.uploadFile(files.document, "./documents/", files.document.name);
                    reqObj.documents.push({ link: file_url, type: reqObj.document_type });
                }
            }

            if (reqObj.contact_person) {
                try {
                    reqObj.contact_person = JSON.parse(reqObj.contact_person);
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for contact_persons");
                }
            }
            if (reqObj.trophies) {
                try {
                    let trophies = JSON.parse(reqObj.trophies);
                    reqObj.trophies = trophies;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for trophies");
                }
            }

            if (reqObj.position) {
                try {
                    let position = JSON.parse(reqObj.position);
                    reqObj.position = position;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for position");
                }
            }

            if (reqObj.top_players) {
                try {
                    let top_players = JSON.parse(reqObj.top_players);
                    reqObj.top_players = top_players;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for top_players");
                }
            }

            if (reqObj.owner) {
                try {
                    let owner = JSON.parse(reqObj.owner);
                    reqObj.owner = owner;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for owner");
                }
            }

            if (reqObj.manager) {
                try {
                    let manager = JSON.parse(reqObj.manager);
                    reqObj.manager = manager;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for manager");
                }
            }

            if (reqObj.top_signings) {
                try {
                    let top_signings = JSON.parse(reqObj.top_signings);
                    reqObj.top_signings = top_signings;
                } catch (e) {
                    console.log(e);
                    throw new errors.ValidationFailed("Invalid value for top_signings");
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
        contact_person, trophies, club_academy_details, top_signings, associated_players,
        registration_number, member_type, social_profiles, type, league, league_other
    }) {
        return {
            nationality, top_players, first_name, last_name, height, weight, dob,
            institute, documents, about, bio, position, strong_foot, weak_foot, former_club,
            former_academy, specialization, player_type, email, name, avatar_url, state,
            country, city, phone, founded_in, address, stadium_name, owner, manager, short_name,
            contact_person, trophies, club_academy_details, top_signings, associated_players,
            registration_number, member_type, social_profiles, type, league, league_other
        };
    }
}

module.exports = UserProfileService;
