import { Report } from '../models/Report.js';
import { Donation } from '../models/Donation.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const createReport = async (req, res, next) => {
  try {
    const { donationId, reason, description } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    const report = await Report.create({
      reporter: req.user._id,
      donation: donationId,
      reason,
      description: description || '',
      status: 'PENDING',
    });

    return ApiResponse.created(
      res,
      { report },
      'Thank you. Your report has been submitted for administrator review.'
    );
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email role')
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName email phone' },
      })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { reports });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return next(ApiError.notFound('Report not found'));
    }

    report.status = status || 'RESOLVED';
    report.actionTaken = actionTaken || '';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    return ApiResponse.success(res, { report }, 'Report resolved successfully');
  } catch (error) {
    next(error);
  }
};
