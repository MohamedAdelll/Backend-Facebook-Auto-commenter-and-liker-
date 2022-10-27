const User = require("../models/Users");

const insert = (data) =>{
    const user = new User(data);
    return user.save();
};

const loginUser = (loginData) => {
    return User.findOne(loginData)
}

const list = (query) => {
    return User.find({
        $or: [
            { full_name: { $regex: '.*' + query.search + '.*' } }, 
            { email: { $regex: '.*' + query.search + '.*' } }
        ]
    });
};

const listForExt = (userId, query) => {
    return User.find({
        $and: [
            {'_id': {$ne: userId}},
            {'isAdmin': false},
            { $or: [{ user_name: { $regex: new RegExp("^" + query.search, "i") } }, { email: { $regex: new RegExp("^" + query.search, "i") } } ] },
        ]
    }).sort({'createdAt': -1});
};

const updateForList = (id) => {
    return User.findOne({_id : id}).select('-password -isAdmin -createdAt -updatedAt -lastLoginDate -_id ');
};

const modify = (where, updateData) => {
    return User.findOneAndUpdate(where, updateData, { new : true });
};

const changePass = async (where, updateData) => {
    const user = await User.findOne(where).select('password');
    if(updateData.current_password == user.password) {
        return User.findOneAndUpdate(where, updateData);
    }
}

const remove = (id) => {
    return User.findByIdAndDelete(id);
};

module.exports = {
    insert,
    list,
    listForExt,
    loginUser,
    updateForList,
    modify,
    changePass,
    remove
};