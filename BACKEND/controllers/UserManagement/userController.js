import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/UserManagement/User.js";
import { generateTokenAndSetCookie } from "../../utils/generateTokenAndSetCookie.js";


import {
  sendResetSuccessEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../../Email/UserManagement/emailUser.js";


// Create User
export const addUser = async (req, res) => {
  try {
    const {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password,
      role,
      confirmPassword,
    } = req.body;

    if(!firstName || !lastName || !email || !phoneNumber|| !address || !password || !confirmPassword){
        throw new Error("All fields are Required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhoneNumber = phoneNumber.trim();

    const userAlreadyExists = await User.findOne({ email: normalizedEmail });
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists){
        return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const phoneAlreadyExists = await User.findOne({ phoneNumber: normalizedPhoneNumber });
    if (phoneAlreadyExists) {
        return res.status(400).json({ success: false, message: "Phone number is already registered" });
    }

    // Basic confirm password check (do NOT store it)
    if (password !== confirmPassword) {
      return res.status(400).json({ status: "Passwords do not match" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000+ Math.random() *900000).toString();

    const newUser = new User({
      profilePic,
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber: normalizedPhoneNumber,
      address,
      password: hashed, // store hashed only
      role,
      verificationToken,
      verificationTokenExpiresAt :Date.now()+  24*60*60*1000
    });

  

    await newUser.save();

    //jwt
    generateTokenAndSetCookie(res,newUser._id);

    let emailWarning = null;
    try {
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (emailError) {
      console.error("Verification email failed:", emailError);
      emailWarning = "Account created, but verification email could not be sent right now.";
    }

    
    res.status(201).json({
        success: true,
        message: emailWarning || "User Registered successfully",
        warning: emailWarning,
        user: {
            ...newUser._doc,
            password: undefined,
             },
        });
    } catch (error) {
        console.error("Error in addUser", error);
        if (error?.code === 11000) {
          const duplicateField = Object.keys(error.keyPattern || {})[0];
          const fieldMessages = {
            email: "Email is already registered",
            phoneNumber: "Phone number is already registered",
          };
          return res.status(400).json({
            success: false,
            message: fieldMessages[duplicateField] || "Duplicate value already exists",
          });
        }
        res.status(500).json({success: false, message: error.message || "Failed to register user" });
    }
};




// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // password is select:false in schema; this will exclude it by default
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error fetching users", error: err.message });
  }
};

// Get One User
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: "User not found" });
    return res.status(200).json({ status: "User Fetched", user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error fetching user", error: err.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password,          // optional
      confirmPassword,   // optional, only used if password provided
    } = req.body;

    const updateData = {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
    };

    // If password fields are provided, validate + hash
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ status: "Passwords do not match" });
      }
      if (password && password.length < 8) {
        return res
          .status(400)
          .json({ status: "Password must be at least 8 characters" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updateData, { runValidators: true });
    return res.status(200).json({ status: "User Updated" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error updating user", error: err.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ status: "User Deleted" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error deleting user", error: err.message });
  }
};


//logout 


export const logout = async (req, res) => {

  res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
  
};

//login
export const login = async (req, res) => {
    const { email, password } = req.body;
	try {
		   const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});  
    } catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async(req,res)=>{
  //1,2,3,4,5,6
  const{code}=req.body;

  try{
    const user = await User.findOne({
      verificationToken : code,
      verificationTokenExpiresAt:{$gt:Date.now()}
    })

   if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

    user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

    await sendWelcomeEmail(user.email, user.firstName);

    res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});

  }catch(error){

    console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });

  }
};


export const forgetPassword=async(req,res)=>{

  const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};


export const resetPassword = async(req,res)=>{
  	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};



export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
