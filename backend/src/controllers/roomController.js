const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { name, language } = req.body;

    const room = await Room.create({
      name,
      language,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json({ room });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const alreadyMember = room.members.includes(req.user.id);
    if (!alreadyMember) {
      room.members.push(req.user.id);
      await room.save();
    }

    res.status(200).json({ room });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId })
      .populate('owner', 'username email')
      .populate('members', 'username email');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.saveCode = async (req, res) => {
  try {
    const { roomId } = req.params
    const { code } = req.body

    const room = await Room.findOneAndUpdate(
  { roomId },
  { code },
  { returnDocument: 'after' }
)

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    res.status(200).json({ message: 'Code saved', code: room.code })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}