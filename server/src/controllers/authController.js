import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      organizationName,
      donorType,
      registrationNumber,
      contactPerson,
      availability,
      avatar,
      location,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists.'));
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'donor',
      phone: phone || '',
      organizationName: organizationName || '',
      donorType: donorType || (role === 'donor' ? 'Restaurant' : ''),
      registrationNumber: registrationNumber || '',
      contactPerson: contactPerson || '',
      availability: availability || 'Flexible',
      avatar: avatar || '',
    };

    const locAddress = location?.address || address || '';
    const locCity = location?.city || city || '';
    const locState = location?.state || state || '';
    const locPincode = location?.pincode || pincode || '';
    const coords = location?.coordinates || [0, 0];

    userData.location = {
      type: 'Point',
      coordinates: [
        parseFloat(coords[0] || 0),
        parseFloat(coords[1] || 0),
      ],
      address: locAddress,
      city: locCity,
      state: locState,
      pincode: locPincode,
    };

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    setAuthCookie(res, token);

    return ApiResponse.created(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organizationName: user.organizationName,
          donorType: user.donorType,
          registrationNumber: user.registrationNumber,
          contactPerson: user.contactPerson,
          availability: user.availability,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
      'Registration successful! Welcome to FoodRescue.'
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    if (!user.isActive) {
      return next(
        ApiError.forbidden('Your account has been deactivated. Please contact administrator.')
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    return ApiResponse.success(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organizationName: user.organizationName,
          donorType: user.donorType,
          registrationNumber: user.registrationNumber,
          contactPerson: user.contactPerson,
          availability: user.availability,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return ApiResponse.success(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return ApiResponse.success(res, { user }, 'User session active');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      organizationName,
      donorType,
      registrationNumber,
      contactPerson,
      availability,
      avatar,
      location,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (donorType !== undefined) user.donorType = donorType;
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;
    if (contactPerson !== undefined) user.contactPerson = contactPerson;
    if (availability !== undefined) user.availability = availability;
    if (avatar !== undefined) user.avatar = avatar;

    if (location || address !== undefined || city !== undefined || state !== undefined || pincode !== undefined) {
      const existingLoc = user.location || { type: 'Point', coordinates: [0, 0] };
      user.location = {
        type: 'Point',
        coordinates: [
          parseFloat(location?.coordinates?.[0] ?? existingLoc.coordinates?.[0] ?? 0),
          parseFloat(location?.coordinates?.[1] ?? existingLoc.coordinates?.[1] ?? 0),
        ],
        address: address !== undefined ? address : (location?.address !== undefined ? location.address : (existingLoc.address || '')),
        city: city !== undefined ? city : (location?.city !== undefined ? location.city : (existingLoc.city || '')),
        state: state !== undefined ? state : (location?.state !== undefined ? location.state : (existingLoc.state || '')),
        pincode: pincode !== undefined ? pincode : (location?.pincode !== undefined ? location.pincode : (existingLoc.pincode || '')),
      };
    }

    await user.save();
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
