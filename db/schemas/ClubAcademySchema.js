const uuid = require('uuid/v4');
const mongoose = require('mongoose');
const DocumentStatus = require('../../constants/DocumentStatus');
const DocumentType = require('../../constants/DocumentType');
const AttachmentType = require('../../constants/AttachmentType');

const Schema = mongoose.Schema;
const MEMBER = require('../../constants/MemberType');
const TYPE = require('../../constants/ClubAcademyType');

module.exports = {
    fields: {
        id: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                return uuid()
            }
        },
        user_id: {
            type: String
        },
        deleted_at: {
            type: Date
        },
        name: {
            type: String
        },
        member_type: {
            type: String,
            enum: [MEMBER.CLUB, MEMBER.ACADEMY]
        },
        type: {
            type: String,
            enum: [TYPE.RESIDENTIAL, TYPE.NON_RESIDENTIAL]
        },
        founded_in: {
            type: String
        },
        state: {
            id: {
                type: String
            },
            name: {
                type: String
            }
        },
        country: {
            id: {
                type: String
            },
            name: {
                type: String
            }
        },
        city: {
            id: {
                type: String
            },
            name: {
                type: String
            }
        },
        address: {
            full_address: {
                type: String
            },
            pincode: {
                type: String
            }
        },
        email: {
            type: String
        },
        phone: {
            type: String
        },
        stadium_name: {
            type: String
        },
        owner: {
            name: {
                type: String
            },
            email: {
                type: String
            },
            phone_number: {
                type: String
            }
        },
        manager: {
            name: {
                type: String
            },
            email: {
                type: String
            },
            phone_number: {
                type: String
            }
        },
        short_name: {
            type: String
        },
        documents: [{
            type: {
                type: String, 
                enum: [DocumentType.AIFF]
            },
            added_on:Date,
            document_number:String,
            media: {
                attachment_type: {
                    type:String,
                    enum: [AttachmentType.IMAGE,AttachmentType.PDF]
                },
                document:String,
            },
            status: {
                type: String,
                enum: [DocumentStatus.APPROVED,DocumentStatus.PENDING, DocumentStatus.DISAPPROVED]
            },
            remark:String
        }],
        trophies: [{
            name: { type: String },
            year: { type: String },
            position: { type: String },
            id: {
                type: String,
                required: true,
                default: function () {
                    return uuid()
                }
            }
        }],
        top_players: {
            type: Array
        },
        league: {
            type: String
        },
        league_other: {
            type: String
        },
        association: {
            type: String
        },
        association_other: {
            type: String
        },
        top_signings: [{
            name: { type: String }
        }],
        associated_players: {
            type: Number
        },
        registration_number: {
            type: String
        },
        bio: {
            type: String
        },
        avatar_url: {
            type: String
        },
        social_profiles: {
            facebook: {
                type: String
            },
            youtube: {
                type: String
            },
            twitter: {
                type: String
            },
            instagram: {
                type: String
            }
        },
        contact_person: [{
            name: {
                type: String
            },
            email: {
                type: String
            },
            phone_number: {
                type: String
            },
            designation: {
                type: String
            }
        }],
        login_details: {
            type: Schema.Types.ObjectId, ref: 'login_details'
        }
    },

    schemaName: "club_academy_details",

    options: {
        timestamps: true
    }

};
