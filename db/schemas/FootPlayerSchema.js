const uuidv4 = require("uuid/v4");
const FOOTPLAYER_STATUS = require('../../constants/FootPlayerStatus')

module.exports = {
    fields: {
        id: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                return uuidv4()
            }
        },
        sent_by: {
            type: String
        },
        send_to: {
            user_id: {
                type: String
            },
            f_name: {
                type: String
            },
            l_name: {
                type: String
            },
            email: {
                type: String
            },
            phone: {
                type: String
            }
        },
        status: {
            type: String,
            enum: [FOOTPLAYER_STATUS.ADDED, FOOTPLAYER_STATUS.REJECTED, FOOTPLAYER_STATUS.PENDING],
            default: FOOTPLAYER_STATUS.PENDING
        },
        deleted_at: {
            type: Date
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    schemaName: "foot_players",
    options: {
        timestamps: true
    }
};
