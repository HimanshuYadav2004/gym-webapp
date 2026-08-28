import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.gymOwnerId = decoded.gymOwnerId;
    req.isSuperAdmin = !!decoded.isSuperAdmin;
    req.email = decoded.email;

    // Super admins aren't subject to license gating
    if (!req.isSuperAdmin) {
      const owner = await prisma.gymOwner.findUnique({
        where: { id: req.gymOwnerId },
        select: { licenseStatus: true, licenseExpiresAt: true }
      });

      if (!owner) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      if (owner.licenseStatus === 'pending') {
        return res.status(403).json({ error: 'Your gym registration is awaiting approval', accountStatus: 'pending' });
      }

      if (owner.licenseStatus === 'rejected') {
        return res.status(403).json({ error: 'Your gym registration was not approved', accountStatus: 'rejected' });
      }

      const expired =
        owner.licenseStatus === 'suspended' ||
        (owner.licenseExpiresAt && new Date(owner.licenseExpiresAt) < new Date());

      if (expired) {
        return res.status(402).json({ error: 'License expired', licenseExpired: true });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const superAdminMiddleware = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// Verifies the JWT and identifies the caller WITHOUT the license gate —
// used for the license routes themselves, so an expired account can still
// check its status and pay to renew.
export const identifyMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.gymOwnerId = decoded.gymOwnerId;
    req.isSuperAdmin = !!decoded.isSuperAdmin;
    req.email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
