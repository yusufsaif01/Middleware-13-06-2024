const uuidv4 = require("uuid/v4");

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
        name: {
            type: String
        },
        state_id: {
            type: String
        }
    },
    schemaName: "city",
    options: {
        timestamps: true
    }
};
