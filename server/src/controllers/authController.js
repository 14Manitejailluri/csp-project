import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationName, location } = req.body;

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
    };

    if (location && location.coordinates) {
      userData.location = {
        type: 'Point',
        coordinates: [
          parseFloat(location.coordinates[0] || 0),
          parseFloat(location.coordinates[1] || 0),
        ],
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
      };
    }

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
          isVerified: user.isVerified,
          isActive: user.isActive,
          location: user.location,
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
          isVerified: user.isVerified,
          isActive: user.isActive,
          location: user.location,
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
    const { name, phone, organizationName, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (organizationName !== undefined) user.organizationName = organizationName;

    if (location) {
      user.location = {
        type: 'Point',
        coordinates: [
          parseFloat(location.coordinates?.[0] || user.location.coordinates[0]),
          parseFloat(location.coordinates?.[1] || user.location.coordinates[1]),
        ],
        address: location.address !== undefined ? location.address : user.location.address,
        city: location.city !== undefined ? location.city : user.location.city,
        state: location.state !== undefined ? location.state : user.location.state,
      };
    }

    await user.save();
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
