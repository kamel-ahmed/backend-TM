import Notice from "../models/notification.js";
import User from "../models/user.js";
import { createJWT } from "../utils/index.js";

// signUp

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(200).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;

      user.password = undefined;

      res.status(201).json(user);
    } else {
      return res
        .status(400)
        .json({ status: false, message: "not added user" });
    }
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ===================================================

// login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ status: false, message: err.message });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contant the Administrator",
      });
    }

    const isMatch = await user.matchPassword(password);
    console.log("is match" + isMatch);
    
    if (user && isMatch) {
      createJWT(res, user._id);

      user.password = undefined;

      res.status(200).json(user);
      console.log("is match" + isMatch);
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });

    }
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ===================================================

// log out
export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: Date.now(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==============================================

// getTeamList

export const getTeamList = async (req, res) => {
  try {
    const users = await User.find().select("name title role email isActive");

    res.status(200).json(users);
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==============================================

// getNotificationsList

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.findOne({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==============================================

// updateUserProfile

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      const updateUser = await User.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully",
        user: updateUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User Not Found" });
    }
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==============================================

// markNotificationRead

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate({ _id: id, isRead: { $nin: [userId] } },
        {$push: { isRead: userId}},
        { new: true }
      );
    }

    res.status(201).json({ status:true, message: "Done"})

  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==============================================

                // changeUserPassword

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password chnaged successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }


  } catch (err) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ==============================================

                // for admin only (activateUserProfile)

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if(user){
        user.isActive = req.body.isActive;

        await user.save();


        res.status(201).json({
            status: true,
            message: `User account has been ${
                user.isActive ? 'activated' : 'disable'
            } `
        })
    } else {
        res.status(404).json({ status: false, message: "User not found" });
    }


  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

// ==================================================
                // for admin only (deleteUserProfile)


export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });

  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};



