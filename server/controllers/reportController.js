import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_TYPES = [
  'AGGRESSIVE_DOG',
  'SMALL_PUPPIES',
  'NIGHT_BARKING',
  'LARGE_DOG_POPULATION',
  'INJURED_DOG',
  'STRAY_DOG',
  'OTHER',
];

const VALID_STATUSES = ['PENDING', 'VERIFIED', 'RESOLVED', 'REJECTED'];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw { status: 400, message: 'Invalid latitude. Must be between -90 and 90.' };
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw { status: 400, message: 'Invalid longitude. Must be between -180 and 180.' };
  }
  return { latitude, longitude };
}

async function createReport(req, res, next) {
  try {
    const { type, description, dogCount, latitude, longitude, address } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Valid report type is required' });
    }
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ message: 'Description is required' });
    }
    const count = parseInt(dogCount, 10);
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ message: 'Dog count must be a positive number' });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const coords = validateCoordinates(latitude, longitude);

    const report = await prisma.report.create({
      data: {
        userId: req.user.id,
        type,
        description: description.trim(),
        dogCount: count,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address || null,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, phoneNumber: true } },
      },
    });

    res.status(201).json(report);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
}

async function getAllReports(req, res, next) {
  try {
    const { type, status } = req.query;
    const where = {};

    if (type && VALID_TYPES.includes(type)) where.type = type;
    if (status && VALID_STATUSES.includes(status)) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      include: { user: { select: { id: true, phoneNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, phoneNumber: true } } },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
}

async function getMyReports(req, res, next) {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
}

async function updateReport(req, res, next) {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You can only edit your own reports.' });
    }

    const { type, description, dogCount, latitude, longitude, address, status } = req.body;
    const data = {};

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ message: 'Invalid report type' });
      }
      data.type = type;
    }
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ message: 'Description cannot be empty' });
      }
      data.description = description.trim();
    }
    if (dogCount !== undefined) {
      const count = parseInt(dogCount, 10);
      if (isNaN(count) || count < 1) {
        return res.status(400).json({ message: 'Dog count must be a positive number' });
      }
      data.dogCount = count;
    }
    if (latitude !== undefined && longitude !== undefined) {
      const coords = validateCoordinates(latitude, longitude);
      data.latitude = coords.latitude;
      data.longitude = coords.longitude;
    }
    if (address !== undefined) data.address = address;
    if (status !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can change report status' });
      }
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      data.status = status;
    }

    const updated = await prisma.report.update({
      where: { id: req.params.id },
      data,
      include: { user: { select: { id: true, phoneNumber: true } } },
    });

    res.json(updated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own reports.' });
    }

    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getNearbyReports(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius || '5000', 10);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Valid lat and lng query parameters are required' });
    }

    validateCoordinates(lat, lng);

    const allReports = await prisma.report.findMany({
      include: { user: { select: { id: true, phoneNumber: true } } },
    });

    const nearby = allReports
      .map((report) => ({
        ...report,
        distance: haversineDistance(lat, lng, report.latitude, report.longitude),
      }))
      .filter((report) => report.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
    });

    const stats = {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'PENDING').length,
      verified: reports.filter((r) => r.status === 'VERIFIED').length,
      resolved: reports.filter((r) => r.status === 'RESOLVED').length,
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export {
  createReport,
  getAllReports,
  getReportById,
  getMyReports,
  updateReport,
  deleteReport,
  getNearbyReports,
  getDashboardStats,
};
