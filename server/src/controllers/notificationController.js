import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name organizationName')
      .populate('relatedDonation', 'title foodType quantity quantityUnit')
      .populate('relatedPickup', 'status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return ApiResponse.success(
      res,
      { notifications, unreadCount },
      'Notifications retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return next(ApiError.notFound('Notification not found'));
    }

    notification.isRead = true;
    await notification.save();

    return ApiResponse.success(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return ApiResponse.success(res, {}, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
