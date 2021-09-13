const User = require('../DB/Users');

const addUser = async (req, res) => {
    console.log('add User')
    const { firstName, lastName } = req.body;
    let user = {};
    user.firstName = firstName;
    user.lastName = lastName;
    let userModel = new User(user);
    await userModel.save();
    res.json(userModel);

}

module.exports =  {addUser};