const User = require('../models/user');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// @desc    Register a new User
// @route   POST /api/users
// @access  Public
module.exports.registerUser = async (req, res) => {
  const { email, name, password } = req.body;
  if (!name || !password || !email) {
    res.status(400).json('Please provide all details!');
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400).json({ message: 'User already exists' });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = await User.create({ name, password: hashedPass, email });
    if (user) {
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.name),
      });
    } else {
      res.status(400).json({
        message: 'Invalid user',
      });
    }
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
module.exports.loginUser = async (req, res) => {
  const { email, name, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.name),
    });
  } else {
    res.status(400).json({
      message: 'Invalid credentials',
    });
  }
};

// @desc    Get user info
// @route   GET /api/users/me
// @access  Private
module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(400).json({ message: 'User not found' });
    }
    res.status(200).json({
      email: user.email,
      username: user.name,
      id: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages between users
// @route   GET /api/messages/:id
// @access  Private

module.exports.getMessages = async (req, res) => {
 if(req.params){
  const recipientId = req.params.id;
  const senderId = req.user.id;
  if (recipientId && senderId) {
    try {
      const messages = await Message.find({
        sender: { $in: [senderId, recipientId] },
        recipient: { $in: [senderId, recipientId] },
      }).sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (err) {
      console.log('error occured while fetching messages', err);
      res
        .status(400)
        .json({ message: 'Error occured while retrieving messages' });
    }
  }
}
  else{
    res.json(200).json('Select Recipient first!')
  }
};

//generate token
const generateToken = (id, name) => {
  const data = `${id}+${name}`;
  return jwt.sign({ data }, process.env.SECRET, {
    expiresIn: '30d',
  });
};
